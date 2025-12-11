import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

interface IntegrationsSectionProps {
  providers: any[];
  isLoadingProviders: boolean;
  providerConfigs: Record<string, boolean>;
  configDialogOpen: boolean;
  setConfigDialogOpen: (open: boolean) => void;
  selectedProvider: any;
  wappiToken: string;
  setWappiToken: (token: string) => void;
  wappiProfileId: string;
  setWappiProfileId: (id: string) => void;
  isSaving: boolean;
  addProviderDialogOpen: boolean;
  setAddProviderDialogOpen: (open: boolean) => void;
  newProviderName: string;
  setNewProviderName: (name: string) => void;
  newProviderCode: string;
  setNewProviderCode: (code: string) => void;
  newProviderType: string;
  setNewProviderType: (type: string) => void;
  newProviderWappiToken: string;
  setNewProviderWappiToken: (token: string) => void;
  newProviderWappiProfileId: string;
  setNewProviderWappiProfileId: (id: string) => void;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: (open: boolean) => void;
  providerToDelete: any;
  setProviderToDelete: (provider: any) => void;
  isDeleting: boolean;
  openProviderConfig: (provider: any) => void;
  saveProviderConfig: () => void;
  deleteProvider: () => void;
  loadProviders: () => void;
}

const IntegrationsSection = ({
  providers,
  isLoadingProviders,
  providerConfigs,
  configDialogOpen,
  setConfigDialogOpen,
  selectedProvider,
  wappiToken,
  setWappiToken,
  wappiProfileId,
  setWappiProfileId,
  isSaving,
  addProviderDialogOpen,
  setAddProviderDialogOpen,
  newProviderName,
  setNewProviderName,
  newProviderCode,
  setNewProviderCode,
  newProviderType,
  setNewProviderType,
  newProviderWappiToken,
  setNewProviderWappiToken,
  newProviderWappiProfileId,
  setNewProviderWappiProfileId,
  deleteDialogOpen,
  setDeleteDialogOpen,
  providerToDelete,
  setProviderToDelete,
  isDeleting,
  openProviderConfig,
  saveProviderConfig,
  deleteProvider,
  loadProviders
}: IntegrationsSectionProps) => {
  return (
    <>
      {isLoadingProviders ? (
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={32} className="animate-spin text-primary" />
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="Inbox" size={48} className="mx-auto mb-3 opacity-50 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">Подключения не найдены</p>
          <Button onClick={() => setAddProviderDialogOpen(true)}>
            <Icon name="Plus" size={16} className="mr-2" />
            Добавить первое подключение
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {providers.map((provider) => (
            <Card key={provider.id} className="p-6 bg-card/50 backdrop-blur-sm border-border hover:shadow-lg hover:shadow-primary/20 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Icon name={provider.icon} size={28} className="text-primary" />
                </div>
                <Badge 
                  variant={
                    provider.status === 'working' ? 'default' : 
                    provider.status === 'configured' ? 'secondary' : 
                    provider.status === 'error' ? 'destructive' : 
                    'outline'
                  }
                  className={
                    provider.status === 'configured' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : ''
                  }
                >
                  {provider.status === 'working' && (
                    <>
                      <Icon name="CheckCircle" size={12} className="mr-1" />
                      Работает
                    </>
                  )}
                  {provider.status === 'configured' && (
                    <>
                      <Icon name="Settings" size={12} className="mr-1" />
                      Настроен
                    </>
                  )}
                  {provider.status === 'error' && (
                    <>
                      <Icon name="AlertCircle" size={12} className="mr-1" />
                      Ошибка
                    </>
                  )}
                  {provider.status === 'not_configured' && (
                    <>
                      <Icon name="AlertTriangle" size={12} className="mr-1" />
                      Не настроен
                    </>
                  )}
                </Badge>
              </div>
              <h3 className="text-xl font-bold mb-2">{provider.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {provider.requests.toLocaleString()} запросов за сегодня
              </p>
              {provider.usesWappi && (
                <div className="mb-3 px-3 py-2 bg-primary/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icon name="Zap" size={14} className="text-primary" />
                    <span className="text-xs font-medium text-primary">Работает через Wappi</span>
                  </div>
                </div>
              )}
              {provider.lastAttemptAt && (
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground">
                    Последний запрос: {new Date(provider.lastAttemptAt).toLocaleString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openProviderConfig(provider)}
                >
                  <Icon name="Settings" size={16} className="mr-2" />
                  Настроить
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Icon name="MoreVertical" size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openProviderConfig(provider)}>
                      <Icon name="Settings" size={14} className="mr-2" />
                      Настроить
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => {
                        // TODO: Implement view logs
                      }}
                    >
                      <Icon name="FileText" size={14} className="mr-2" />
                      Логи
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        setProviderToDelete(provider);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Icon name="Trash2" size={14} className="mr-2" />
                      Удалить
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {selectedProvider && (
                <>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={selectedProvider.icon} size={20} className="text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Настройка {selectedProvider.name}</span>
                    {providerConfigs[selectedProvider.code] && (
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                        <Icon name="CheckCircle" size={12} className="mr-1" />
                        Настроено
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedProvider?.usesWappi ? (
                <>
                  {providerConfigs[selectedProvider.code] 
                    ? `Обновите настройки интеграции ${selectedProvider.name} с Wappi.`
                    : `Для работы ${selectedProvider.name} требуется настроить интеграцию с Wappi.`
                  }
                  <br />
                  <a 
                    href="https://wappi.pro" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1 mt-2"
                  >
                    Получить ключи в личном кабинете Wappi
                    <Icon name="ExternalLink" size={14} />
                  </a>
                </>
              ) : (
                `Настройте параметры подключения для ${selectedProvider?.name}`
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedProvider?.usesWappi ? (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="wappi-token">API Token</Label>
                <Input
                  id="wappi-token"
                  placeholder="Введите токен Wappi"
                  value={wappiToken}
                  onChange={(e) => setWappiToken(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Токен авторизации из личного кабинета wappi.pro
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wappi-profile">Profile ID</Label>
                <Input
                  id="wappi-profile"
                  placeholder="Введите ID профиля"
                  value={wappiProfileId}
                  onChange={(e) => setWappiProfileId(e.target.value)}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Идентификатор профиля для работы с API
                </p>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <Icon name="Info" size={20} className="text-primary mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Как получить данные:</p>
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Зайдите на wappi.pro</li>
                      <li>Откройте раздел "Настройки API"</li>
                      <li>Скопируйте Token и Profile ID</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-4">
              <p className="text-sm text-muted-foreground">
                Настройки для этого провайдера будут доступны позже.
              </p>
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setConfigDialogOpen(false)}
              disabled={isSaving}
            >
              Отмена
            </Button>
            {selectedProvider?.usesWappi && (
              <Button 
                onClick={saveProviderConfig}
                disabled={!wappiToken || !wappiProfileId || isSaving}
              >
                {isSaving ? (
                  <>
                    <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  <>
                    <Icon name="Check" size={16} className="mr-2" />
                    Сохранить
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addProviderDialogOpen} onOpenChange={setAddProviderDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="Plus" size={20} className="text-primary" />
              </div>
              <span>Добавить подключение</span>
            </DialogTitle>
            <DialogDescription>
              Выберите провайдера и настройте подключение к каналу связи
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="provider-name">Название подключения</Label>
              <Input
                id="provider-name"
                placeholder="WhatsApp Business"
                value={newProviderName}
                onChange={(e) => setNewProviderName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Отображаемое имя подключения в интерфейсе
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider-code">Код для API</Label>
              <Input
                id="provider-code"
                placeholder="whatsapp_business"
                value={newProviderCode}
                onChange={(e) => setNewProviderCode(e.target.value.toLowerCase().replace(/\s+/g, '_'))}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Уникальный идентификатор для использования в API запросах
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider-type">Провайдер</Label>
              <Select value={newProviderType} onValueChange={setNewProviderType}>
                <SelectTrigger id="provider-type">
                  <SelectValue placeholder="Выберите провайдера" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wappi">Wappi (WhatsApp, Telegram, MAX)</SelectItem>
                  <SelectItem value="sms">SMS Gateway</SelectItem>
                  <SelectItem value="email">Email SMTP</SelectItem>
                  <SelectItem value="push">Push Notifications</SelectItem>
                  <SelectItem value="custom">Другой / Custom</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Провайдер для отправки сообщений
              </p>
            </div>

            {newProviderType === 'wappi' && (
              <>
                <div className="p-4 bg-muted/50 rounded-lg border border-border">
                  <div className="flex items-start gap-3">
                    <Icon name="Info" size={20} className="text-primary mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium mb-1">Настройки Wappi:</p>
                      <p className="text-muted-foreground mb-2">
                        Для работы через Wappi необходимо указать API токен и Profile ID
                      </p>
                      <a 
                        href="https://wappi.pro" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline inline-flex items-center gap-1"
                      >
                        Получить ключи в личном кабинете
                        <Icon name="ExternalLink" size={12} />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-wappi-token">API Token</Label>
                  <Input
                    id="new-wappi-token"
                    placeholder="Введите токен Wappi"
                    value={newProviderWappiToken}
                    onChange={(e) => setNewProviderWappiToken(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-wappi-profile">Profile ID</Label>
                  <Input
                    id="new-wappi-profile"
                    placeholder="Введите ID профиля"
                    value={newProviderWappiProfileId}
                    onChange={(e) => setNewProviderWappiProfileId(e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
              </>
            )}

            {newProviderType && newProviderType !== 'wappi' && (
              <div className="p-4 bg-muted/50 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <Icon name="AlertCircle" size={20} className="text-yellow-500 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Дополнительная интеграция:</p>
                    <p className="text-muted-foreground">
                      Для работы с этим провайдером потребуется дополнительная настройка в коде бэкенда
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setAddProviderDialogOpen(false);
                setNewProviderName('');
                setNewProviderCode('');
                setNewProviderType('');
                setNewProviderWappiToken('');
                setNewProviderWappiProfileId('');
              }}
              disabled={isSaving}
            >
              Отмена
            </Button>
            <Button 
              onClick={async () => {
                if (!newProviderName || !newProviderCode || !newProviderType) {
                  return;
                }
                
                if (newProviderType === 'wappi' && (!newProviderWappiToken || !newProviderWappiProfileId)) {
                  return;
                }

                setIsSaving(true);
                try {
                  const config: any = {};
                  
                  if (newProviderType === 'wappi') {
                    config.wappi_token = newProviderWappiToken;
                    config.wappi_profile_id = newProviderWappiProfileId;
                  }

                  const response = await fetch('https://functions.poehali.dev/c55cf921-d1ec-4fc7-a6e2-59c730988a1e', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'X-Api-Key': 'ek_live_j8h3k2n4m5p6q7r8'
                    },
                    body: JSON.stringify({
                      provider_code: newProviderCode,
                      provider_name: newProviderName,
                      provider_type: newProviderType,
                      ...config
                    })
                  });
                  
                  const data = await response.json();
                  
                  if (data.success) {
                    setAddProviderDialogOpen(false);
                    setNewProviderName('');
                    setNewProviderCode('');
                    setNewProviderType('');
                    setNewProviderWappiToken('');
                    setNewProviderWappiProfileId('');
                    await loadProviders();
                  }
                } catch (error) {
                  console.error('Failed to add provider:', error);
                } finally {
                  setIsSaving(false);
                }
              }}
              disabled={
                !newProviderName || 
                !newProviderCode || 
                !newProviderType || 
                (newProviderType === 'wappi' && (!newProviderWappiToken || !newProviderWappiProfileId)) ||
                isSaving
              }
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Добавление...
                </>
              ) : (
                <>
                  <Icon name="Check" size={16} className="mr-2" />
                  Добавить подключение
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} className="text-destructive" />
              </div>
              <span>Удалить подключение?</span>
            </AlertDialogTitle>
            <AlertDialogDescription>
              {providerToDelete && (
                <>
                  Вы действительно хотите удалить подключение <strong>{providerToDelete.name}</strong>?
                  <br />
                  <br />
                  Это действие нельзя отменить. Все настройки и история отправок будут утеряны.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteProvider();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                  Удаление...
                </>
              ) : (
                <>
                  <Icon name="Trash2" size={16} className="mr-2" />
                  Удалить
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default IntegrationsSection;
