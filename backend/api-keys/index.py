import json
import os
import secrets
from datetime import datetime, timedelta
from typing import Dict, Any, Optional
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    """Создает подключение к базе данных"""
    return psycopg2.connect(
        os.environ['DATABASE_URL'],
        cursor_factory=RealDictCursor
    )

def verify_api_key(api_key: str, conn) -> bool:
    """Проверяет валидность API ключа для доступа к управлению ключами"""
    cur = conn.cursor()
    cur.execute(
        "SELECT id FROM api_keys WHERE api_key = %s AND is_active = true",
        (api_key,)
    )
    result = cur.fetchone()
    cur.close()
    return result is not None

def generate_api_key() -> str:
    """Генерирует безопасный API ключ"""
    random_part = secrets.token_urlsafe(32)[:24]
    return f"ek_live_{random_part}"

def calculate_expiry_date(expiry_days: str) -> Optional[datetime]:
    """Вычисляет дату истечения на основе выбранного периода"""
    if expiry_days == 'never':
        return None
    
    days = int(expiry_days)
    return datetime.now() + timedelta(days=days)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    Управление API ключами: создание, обновление (перевыпуск), удаление
    
    POST /api/keys - Создать новый ключ
    Body: {"key_name": "Production Key", "expiry_days": "never|30|90|180|365"}
    
    POST /api/keys/regenerate - Перевыпустить ключ
    Body: {"key_id": 1}
    
    DELETE /api/keys?key_id=1 - Удалить ключ
    
    Headers: X-Api-Key
    """
    method = event.get('httpMethod', 'GET')
    path = event.get('path', '')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Api-Key',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        headers = event.get('headers', {})
        api_key = headers.get('x-api-key') or headers.get('X-Api-Key')
        
        if not api_key:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Missing API key'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        
        if not verify_api_key(api_key, conn):
            conn.close()
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid API key'}),
                'isBase64Encoded': False
            }
        
        if method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action', 'create')
            
            if action == 'regenerate':
                key_id = body_data.get('key_id')
                
                if not key_id:
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing key_id'}),
                        'isBase64Encoded': False
                    }
                
                cur = conn.cursor()
                cur.execute(
                    "SELECT key_name, expiry_date FROM api_keys WHERE id = %s",
                    (key_id,)
                )
                existing_key = cur.fetchone()
                
                if not existing_key:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'API key not found'}),
                        'isBase64Encoded': False
                    }
                
                new_api_key = generate_api_key()
                
                cur.execute(
                    """UPDATE api_keys 
                    SET api_key = %s, created_at = NOW(), last_used_at = NULL 
                    WHERE id = %s""",
                    (new_api_key, key_id)
                )
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'message': 'API key regenerated successfully',
                        'key_id': key_id,
                        'api_key': new_api_key,
                        'key_name': existing_key['key_name']
                    }),
                    'isBase64Encoded': False
                }
            
            else:
                key_name = body_data.get('key_name')
                expiry_days = body_data.get('expiry_days', 'never')
                
                if not key_name:
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Missing key_name'}),
                        'isBase64Encoded': False
                    }
                
                new_api_key = generate_api_key()
                expiry_date = calculate_expiry_date(expiry_days)
                
                cur = conn.cursor()
                cur.execute(
                    """INSERT INTO api_keys (key_name, api_key, is_active, expiry_date, created_at)
                    VALUES (%s, %s, true, %s, NOW())
                    RETURNING id""",
                    (key_name, new_api_key, expiry_date)
                )
                result = cur.fetchone()
                key_id = result['id']
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'success': True,
                        'message': 'API key created successfully',
                        'key_id': key_id,
                        'api_key': new_api_key,
                        'key_name': key_name,
                        'expiry_date': expiry_date.isoformat() if expiry_date else None
                    }),
                    'isBase64Encoded': False
                }
        
        elif method == 'DELETE':
            params = event.get('queryStringParameters') or {}
            key_id = params.get('key_id')
            
            if not key_id:
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Missing key_id parameter'}),
                    'isBase64Encoded': False
                }
            
            cur = conn.cursor()
            
            cur.execute(
                "SELECT key_name FROM api_keys WHERE id = %s",
                (key_id,)
            )
            existing_key = cur.fetchone()
            
            if not existing_key:
                cur.close()
                conn.close()
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'API key not found'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "DELETE FROM api_keys WHERE id = %s",
                (key_id,)
            )
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': f'API key "{existing_key["key_name"]}" deleted successfully'
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'GET':
            cur = conn.cursor()
            cur.execute(
                """SELECT id, key_name, api_key, is_active, expiry_date, 
                   created_at, last_used_at
                   FROM api_keys 
                   ORDER BY created_at DESC"""
            )
            keys = cur.fetchall()
            cur.close()
            conn.close()
            
            result = []
            for key in keys:
                result.append({
                    'id': key['id'],
                    'key_name': key['key_name'],
                    'api_key': key['api_key'],
                    'is_active': key['is_active'],
                    'expiry_date': key['expiry_date'].isoformat() if key['expiry_date'] else None,
                    'created_at': key['created_at'].isoformat() if key['created_at'] else None,
                    'last_used_at': key['last_used_at'].isoformat() if key['last_used_at'] else None
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'keys': result
                }),
                'isBase64Encoded': False
            }
        
        else:
            conn.close()
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
        
    except json.JSONDecodeError:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Invalid JSON in request body'}),
            'isBase64Encoded': False
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Internal server error', 'details': str(e)}),
            'isBase64Encoded': False
        }
