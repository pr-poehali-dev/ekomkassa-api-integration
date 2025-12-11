import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DashboardSectionProps {
  activeSection: string;
  providers: any[];
  logs: any[];
}

const DashboardSection = ({
  activeSection,
  providers,
  logs
}: DashboardSectionProps) => {
  const stats = [
    { label: 'Всего запросов', value: '4,929', change: '+12.5%', icon: 'TrendingUp', color: 'text-primary' },
    { label: 'Активных провайдеров', value: '4/5', change: '80%', icon: 'Activity', color: 'text-secondary' },
    { label: 'Успешных доставок', value: '98.2%', change: '+2.1%', icon: 'CheckCircle', color: 'text-green-400' },
    { label: 'Средняя скорость', value: '245ms', change: '-15ms', icon: 'Zap', color: 'text-yellow-400' },
  ];

  if (activeSection === 'dashboard') {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6 bg-card/50 backdrop-blur-sm border-border hover:bg-card/80 transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className={`text-xs mt-2 ${stat.color}`}>{stat.change}</p>
                </div>
                <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                  <Icon name={stat.icon} size={24} />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 bg-card/50 backdrop-blur-sm border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="Activity" size={20} className="text-primary" />
              Активность провайдеров
            </h3>
            <div className="space-y-4">
              {providers.map((provider) => (
                <div key={provider.id} className="flex items-center justify-between p-4 bg-background/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon name={provider.icon} size={20} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">{provider.requests.toLocaleString()} запросов</p>
                    </div>
                  </div>
                  <Badge variant={provider.status === 'active' ? 'default' : 'secondary'}>
                    {provider.status === 'active' ? 'Активен' : 'Не активен'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Icon name="FileText" size={20} className="text-secondary" />
              Последние логи
            </h3>
            <div className="space-y-3">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="p-3 bg-background/50 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{log.time}</span>
                    <Badge variant={log.status === 200 ? 'default' : 'destructive'} className="text-xs">
                      {log.status}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{log.provider}</p>
                  <p className="text-xs text-muted-foreground">{log.duration}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (activeSection === 'settings') {
    return (
      <div className="max-w-2xl">
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border">
          <h3 className="text-lg font-semibold mb-6">Общие настройки</h3>
          <div className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Название проекта</label>
              <Input defaultValue="Ekomkassa Integration Hub" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Webhook URL</label>
              <Input defaultValue="https://api.ekomkassa.com/webhooks" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Timeout (мс)</label>
              <Input type="number" defaultValue="5000" />
            </div>
            <div className="pt-4">
              <Button>Сохранить изменения</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (activeSection === 'docs') {
    return (
      <div className="max-w-4xl">
        <Card className="p-6 bg-card/50 backdrop-blur-sm border-border mb-6">
          <h3 className="text-2xl font-bold mb-4">API Документация</h3>
          <p className="text-muted-foreground mb-6">
            Integration Hub API позволяет отправлять уведомления через различные каналы связи с единым интерфейсом.
          </p>
          
          <Tabs defaultValue="auth" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="auth">Аутентификация</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
              <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
              <TabsTrigger value="telegram">Telegram</TabsTrigger>
            </TabsList>

            <TabsContent value="auth" className="space-y-4">
              <div className="bg-background/50 p-4 rounded-lg border border-border">
                <h4 className="font-semibold mb-2">API Key Authentication</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Все запросы должны содержать API ключ в заголовке:
                </p>
                <code className="block bg-background p-3 rounded text-sm font-mono border border-border">
                  Authorization: Bearer ek_live_your_api_key_here
                </code>
              </div>
            </TabsContent>

            <TabsContent value="sms" className="space-y-4">
              <div className="bg-background/50 p-4 rounded-lg border border-border">
                <h4 className="font-semibold mb-2">Отправка SMS</h4>
                <p className="text-sm text-muted-foreground mb-3">POST /api/sms/send</p>
                <code className="block bg-background p-3 rounded text-sm font-mono border border-border whitespace-pre">
{`{
  "phone": "+79991234567",
  "message": "Ваш код: 1234"
}`}
                </code>
              </div>
            </TabsContent>

            <TabsContent value="whatsapp" className="space-y-4">
              <div className="bg-background/50 p-4 rounded-lg border border-border">
                <h4 className="font-semibold mb-2">Отправка WhatsApp сообщения</h4>
                <p className="text-sm text-muted-foreground mb-3">POST /api/whatsapp/send</p>
                <code className="block bg-background p-3 rounded text-sm font-mono border border-border whitespace-pre">
{`{
  "phone": "+79991234567",
  "message": "Заказ #1234 готов"
}`}
                </code>
              </div>
            </TabsContent>

            <TabsContent value="telegram" className="space-y-4">
              <div className="bg-background/50 p-4 rounded-lg border border-border">
                <h4 className="font-semibold mb-2">Отправка Telegram сообщения</h4>
                <p className="text-sm text-muted-foreground mb-3">POST /api/telegram/send</p>
                <code className="block bg-background p-3 rounded text-sm font-mono border border-border whitespace-pre">
{`{
  "chat_id": "123456789",
  "message": "Новое уведомление"
}`}
                </code>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

  return null;
};

export default DashboardSection;
