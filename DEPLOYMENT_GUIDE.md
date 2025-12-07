# 🚀 Руководство по развертыванию на VPS

Этот документ описывает, как настроить автоматическое развертывание вашего сайта на VPS через GitHub Actions.

## 📋 Предварительные требования

- VPS с SSH доступом
- Git установлен на VPS
- Веб-сервер (Nginx или Apache) настроен на VPS
- Репозиторий на GitHub

---

## 🔧 Шаг 1: Подготовка VPS

### 1.1 Подключитесь к VPS по SSH

```bash
ssh your_username@your_vps_ip
```

### 1.2 Создайте директорию для проекта

```bash
# Например, для Nginx
sudo mkdir -p /var/www/web-site

# Или для Apache
sudo mkdir -p /var/www/html/web-site

# Установите права доступа
sudo chown -R $USER:$USER /var/www/web-site
```

### 1.3 Клонируйте репозиторий на VPS

```bash
cd /var/www/web-site
git clone https://github.com/slaffka85/web-site.git .
```

### 1.4 Создайте SSH ключ для GitHub Actions

```bash
# Создайте новый SSH ключ (без пароля!)
ssh-keygen -t rsa -b 4096 -C "github-actions" -f ~/.ssh/github_actions_key -N ""

# Добавьте публичный ключ в authorized_keys
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# Выведите приватный ключ (скопируйте его полностью!)
cat ~/.ssh/github_actions_key
```

**⚠️ ВАЖНО:** Скопируйте весь приватный ключ (включая строки `-----BEGIN ... KEY-----` и `-----END ... KEY-----`)

---

## 🔐 Шаг 2: Настройка GitHub Secrets

Перейдите в ваш репозиторий на GitHub:

1. **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

2. Создайте следующие секреты:

| Имя секрета | Описание | Пример значения |
|-------------|----------|-----------------|
| `VPS_HOST` | IP-адрес или домен VPS | `123.45.67.89` или `myserver.com` |
| `VPS_USERNAME` | SSH пользователь | `root` или `ubuntu` |
| `VPS_SSH_KEY` | Приватный SSH ключ | Весь текст из `~/.ssh/github_actions_key` |
| `VPS_PORT` | SSH порт | `22` (обычно) |
| `VPS_PROJECT_PATH` | Путь к проекту на VPS | `/var/www/web-site` |

### Как добавить секрет:

1. Нажмите **New repository secret**
2. Введите **Name** (например, `VPS_HOST`)
3. Введите **Value** (например, `123.45.67.89`)
4. Нажмите **Add secret**
5. Повторите для всех секретов

---

## 🌐 Шаг 3: Настройка веб-сервера

### Вариант A: Nginx

Создайте конфигурацию:

```bash
sudo nano /etc/nginx/sites-available/web-site
```

Добавьте:

```nginx
server {
    listen 80;
    server_name your_domain.com;  # Замените на ваш домен или IP
    
    root /var/www/web-site;
    index index.html;
    
    location / {
        try_files $uri $uri/ =404;
    }
    
    # Кэширование статических файлов
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Активируйте конфигурацию:

```bash
sudo ln -s /etc/nginx/sites-available/web-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Вариант B: Apache

Создайте конфигурацию:

```bash
sudo nano /etc/apache2/sites-available/web-site.conf
```

Добавьте:

```apache
<VirtualHost *:80>
    ServerName your_domain.com
    DocumentRoot /var/www/web-site
    
    <Directory /var/www/web-site>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/web-site-error.log
    CustomLog ${APACHE_LOG_DIR}/web-site-access.log combined
</VirtualHost>
```

Активируйте конфигурацию:

```bash
sudo a2ensite web-site.conf
sudo apache2ctl configtest
sudo systemctl reload apache2
```

---

## 🔒 Шаг 4: Настройка SSL (Опционально, но рекомендуется)

Используйте Let's Encrypt для бесплатного SSL сертификата:

```bash
# Установите Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx  # для Nginx
# или
sudo apt install certbot python3-certbot-apache  # для Apache

# Получите сертификат
sudo certbot --nginx -d your_domain.com  # для Nginx
# или
sudo certbot --apache -d your_domain.com  # для Apache
```

---

## ✅ Шаг 5: Тестирование

1. **Сделайте изменение в коде:**
   ```bash
   # На вашем локальном компьютере
   echo "<!-- Test deployment -->" >> index.html
   git add .
   git commit -m "Test deployment"
   git push
   ```

2. **Проверьте GitHub Actions:**
   - Перейдите в репозиторий на GitHub
   - Вкладка **Actions**
   - Вы должны увидеть запущенный workflow "Deploy to VPS"

3. **Проверьте сайт:**
   - Откройте браузер
   - Перейдите на `http://your_domain.com` или `http://your_vps_ip`
   - Изменения должны быть видны!

---

## 🔧 Устранение неполадок

### Проблема: "Permission denied"

```bash
# На VPS проверьте права доступа
ls -la /var/www/web-site
sudo chown -R $USER:$USER /var/www/web-site
chmod 755 /var/www/web-site
```

### Проблема: "Host key verification failed"

Добавьте в `.github/workflows/deploy.yml` параметр:

```yaml
script_stop: false
```

### Проблема: Git pull требует пароль

```bash
# На VPS настройте SSH для GitHub
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
cat ~/.ssh/id_rsa.pub
# Добавьте этот ключ в GitHub: Settings → SSH and GPG keys
```

---

## 📝 Альтернативный метод: rsync вместо git pull

Если вы хотите копировать файлы напрямую (без git на сервере), замените в `deploy.yml`:

```yaml
script: |
  # Создайте директорию если её нет
  mkdir -p ${{ secrets.VPS_PROJECT_PATH }}
```

И добавьте шаг с rsync:

```yaml
- name: Deploy files via rsync
  uses: burnett01/rsync-deployments@5.2
  with:
    switches: -avzr --delete
    path: ./
    remote_path: ${{ secrets.VPS_PROJECT_PATH }}
    remote_host: ${{ secrets.VPS_HOST }}
    remote_user: ${{ secrets.VPS_USERNAME }}
    remote_key: ${{ secrets.VPS_SSH_KEY }}
```

---

## 🎉 Готово!

Теперь при каждом `git push` в ветку `main`, ваш сайт автоматически обновится на VPS!

### Полезные команды:

```bash
# Проверить статус веб-сервера
sudo systemctl status nginx
# или
sudo systemctl status apache2

# Просмотреть логи
sudo tail -f /var/log/nginx/error.log
# или
sudo tail -f /var/log/apache2/error.log

# Перезапустить веб-сервер
sudo systemctl restart nginx
# или
sudo systemctl restart apache2
```

---

## 📚 Дополнительные ресурсы

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Apache Documentation](https://httpd.apache.org/docs/)
- [Let's Encrypt](https://letsencrypt.org/)
