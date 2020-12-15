# nodejs-output-static
Фильтр запросов статичных ресурсов
```
Возвращает запрашиваемый ресурс, если
- он является файлом,
- его расширению сопоставлен MIME,
- он не запрещен для скачивания.

В противном случае возвращается ошибка.
Для определения MIME используется модуль "output-static-mime" - список допустимых расширений.
```
## Пример подключения
```JS
var static = require('output-static')(
	//Запрет доступа
	forbidden		: ['/server.js', '/node_modules/', '/views/'],
	//Очищаемые файлы js или css от комментарие
	clear			: ['/js/app.js', '/css/style.css'],	
	//Список mime						
	mime			: require('output-static-mime'),	
	//Режим отладки (добавлять ошибки заппросов в лог)
	isDebug			: true,
);
```
## Примеры использования:
```JS
var http = require('http');
//Формируем задачу
var app = function(req, res) {
	//Фильтруем запросы статичных ресурсов
	static.filter (req, res, function (err) {
		if (!err) return;
		if (err.code>1) {
			//Запрашиваемый ресурс не существует, не найдено mime или запрещен к нему доступ
			if (static.config.isDebug) console.log('ERROR:', static.errors[err.code], req.url);
			res.writeHead(404);
			res.end();
			return;
		}
		
		//Обработка динамичных запросов
		//...
	});
};
//Создаем и запускаем сервер для задачи
var server = http.createServer(app);
server.listen(myConfig.data.port);
//Отображаем информацию о старте сервера
if (myConfig.data.isDebug) console.log('Server start on port ' + myConfig.data.port + ' ...');
```

## Тестирование
```
Пример серверного кода для проверки работоспособности расположен в директории "_demo"
В качестве примера используются запрос файла подключения JQuery, .css, .js, файла видео .mp4 и файла favicon.ico
```
### Запуск тестов
```
node server
```
### Результат
```
http://localhost:2020
```
