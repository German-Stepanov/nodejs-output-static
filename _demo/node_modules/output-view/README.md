# nodejs-output-view
Шаблонизатор для nodejs
```HTML+PHP
Автоматически подсвечивает php-тэги в любом текстовом редакторе
Поддерживает передачу любых переменных в файл html(php):
  	Строки
  	Объекты
  	Функции
Поддерживает использование логических блоков
  	if-elseif-else-endif
  	foreach-endforeach
  	for-endfor
  	while-endwhile
Поддерживает любые переменные и выражения на js
  	<?=$название?>
  	<?=$переменная1 * переменная2?>
Поддерживает создание и использование переменных внутри кода HTML
  	<?
    		var $i=1;
  	?>
  	...
  	<?
    		$i++;
  	?>
  
  	<?=$i?>
Очищает код от всех комментариев, пробелов и переносов строк (опционально)
```

## Пример кода сервера (файл _demo/server.js)
```JavaScript
//Устанавливаем конфигурацию
myConfig = {};
//Конфигурация пользователя (глобальная)
myConfig.data = {
	port		: 2020,
	isDebug		: true,		//Сообшения сервера
};
//Конфигурация модуля Output
myConfig.output = {
	//Папка отображений
	dir 		: require('path').dirname(require.main.filename),
	//Очищать код		
	clear 		: false,
	//Режим отладки
	isDebug		: false,						
};

var output = require('output-view')(myConfig.output);

var http = require('http');
//Формируем задачу
var app = function(req, res) {
	if (myConfig.data.isDebug) {
		console.log('\nПолучен запрос req.url', req.url);
		console.time('app');//Установим метку времени
	}
	req.output = output;

	var rows = 
	[
		{user_id: 11, user_name:'Андрей', 	user_family:'Иванов', 	user_active:1},
		{user_id: 121, user_name:'Петр', 	user_family:'Петров', 	user_active:1},
		{user_id: 13, user_name:'Алексей',	user_family:'Сидоров', 	user_active:1},
		{user_id: 142, user_name:'Сергей', 	user_family:'Алексеев', user_active:1},
		{user_id: 15, user_name:'Герман', 	user_family:'Степанов', user_active:0},
	];

	res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
/*	
	res.write(
		req.output.view({
			text	: 'Hello, World!', 
		})
	);
*/
	res.write(
		req.output.view({
			//Название файла
			file	: '/test.php', 
			//Переменные
			data	: {
				$title 	: 'Список участников:',
				$rows 	: rows,
				width_10: function(str) {
					var count = 10;
					return (new Array( count ).join(' ') + str).substr(-count).replace(/ /g, '&nbsp;');
				}
			},
		})
	);
	
	res.end();
	
	if (myConfig.data.isDebug) {
		console.timeEnd('app');
	}
};
//Создаем и запускаем сервер для задачи
var server = http.createServer(app);
server.listen(myConfig.data.port);
//Отображаем информацию о старте сервера
if (myConfig.data.isDebug) console.log('Server start on port ' + myConfig.data.port + ' ...');
```
## Код отображения (файл _demo/test.php)
```HTML+PHP
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>Пример</title>
    <style>
      body {
        font-family:'Lucida Console', Monaco, monospace
      }
      /*Пример комментария1*/
      .bold {
        font-weight:bold
      }
      /*Пример комментария2*/
      .no_active {
        color:lightgray;
        text-decoration:line-through;
      }
    </style>
  </head>
    
  <body>
    	<!--Заголовок-->
        <div id="title" class="bold"><?='Привет, Мир!'?></div>
        <br />
        <div><?=$title?></div>
    	<!--Таблица-->
        <div>----------------------------------</div>	
        <div>|<?=width_10('ID')?>|<?=width_10('ИМЯ')?>|<?=width_10('ФАМИЛИЯ')?>|</div>
        <div>----------------------------------</div>	
        <?php foreach($rows as $key=>$row): ?>
        	<div class="<?=$row['user_active'] ? '' : 'no_active'?>">|<?=width_10($row['user_id'])?>|<?=width_10($row['user_name'])?>|<?=width_10($row['user_family'])?>|</div>
        <?php endforeach; ?>
       	<div>----------------------------------</div>	
    </body>
</html>
<script>
	/*Комментарий*/
	var a1 = 1; //Комментарий
	var a2 = 'http://test.ru'; //Комментарий
</script>
```
## Запуск
```
	node server
```
## Результат http://localhost:2020
```
*Привет, Мир!*

Список участников:
----------------------------------
|        ID|       ИМЯ|   ФАМИЛИЯ|
----------------------------------
|        11|    Андрей|    Иванов|
|       121|      Петр|    Петров|
|        13|   Алексей|   Сидоров|
|       142|    Сергей|  Алексеев|
|        15|    Герман|  Степанов|
----------------------------------
```
