//Устанавливаем конфигурацию
myConfig = {};
//Конфигурация пользователя (глобальная)
myConfig.data = {
	port		: 2020,
	isDebug		: true,		//Сообшения сервера
};
myConfig.output = {
	//Папка отображений
	dir 		: './views/',
	//Очищать код		
	clear 		: false,
	//Режим отладки
	isDebug		: false,						
};
//Конфигурация модуля Static
myConfig.static = {
	//Запрет лоступа
	forbidden		: 1 ? [] : [ '/server.js', '/node_modules/', '/views/' ],
	//Очищаемые файлы js или css
	clear			: [],	
	//Список mime						
	mime			: require('output-static-mime'),	
	//Режим отладки (добавлять ошибки заппросов в лог)
	isDebug			: true,
};
//Модуль фильтрации разрешенных статических ресурсов
var static = require('../index.js')(myConfig.static);
//Модуль шаблонов 
var output = require('output-view')(myConfig.output);

var http = require('http');
//Формируем задачу
var app = function(req, res) {

	//Фильтруем запросы статических файлов
	static.filter (req, res, function (err) {
		if (!err) return;
		if (err.code>1) {
			//Запрашиваемый ресурс не существует, не найдено mime или запрещен к нему доступ
			if (myConfig.static.isDebug) console.log('ERROR:', static.errors[err.code], req.url);
			res.writeHead(404);
			res.end();
			return;
		}
		
		//Обработка динамичных запросов
		if (myConfig.data.isDebug) {
			console.log('\nПолучен запрос req.url', req.url);
			console.time('app');//Установим метку времени
		}
		
		var controller = '/test';
		var re = new RegExp('^' + controller + '($|/)');
		if (re.test(req.url)) {
			var params = req.url.replace(re, '');
			params = params ? params.split('/') : [];
			console.log('controller= "' + controller + '"', 'params=', params);
			if (params[0]=='clear') {
				//Динамичная установка флага очиски кода модулем output-view
				output.config.clear = true;
				//Динамичная установка флага очиски кода модулем output-static
				static.config.clear = [
					'/css/style.css', '/js/app.js'
				];
			};
			res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
			res.end(
				output.view({
					file : 'page_test.php',
					data : {
						$title : (params[0]!='clear' ? 'Тест #1' : 'Тест #2'),
						$test_name	: (params[0]!='clear' ? 'Тест #1' : 'Тест #2') + '. Web-страница ' + (params[0]!='clear' ? 'с комментариями' : 'без комментариев') + ' в файлах "/views/page_test", "/css/style.css" и "/js/app.js"',
						$img_src	: '/asset/sample.jpg',
						$vido_src 	: '/asset/sample.mp4',
					}
				})
			);
		} else {
			controller = '';
			re = new RegExp('^' + controller + '($|/)');
			var params = req.url.replace(re, '');
			params = params ? params.split('/') : [];
			console.log('controller= "' + controller + '"', 'params=', params);
			//Динамичная установка запрета доступа в модуле output-static
			static.config.forbidden = ['/server.js', '/node_modules/', '/views/'];
			res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
			res.end(
				output.view({
					file : 'page_home.php',
					data : {
						$title 	: 'Список тестов',
						$tests	: 
						[
							{link:'/test', name:'Запрос web-страницы с комментариями в файлах "/views/page_test", "/css/style.css" и "/js/app.js"'},
							{link:'/test/clear', name:'Запрос web-страницы без комментариев в файлах "/views/page_test", "/css/style.css" и "/js/app.js"'},
							{link:'/server.js', name:'Запрос существующего файла "server.js" в корневом каталоге "/". (Доступ запрещен)'},
							{link:'/views/page_home.php', name:'Запрос существующего файла "page_home.php" в папке "/views/". (Доступ запрещен)'},
							{link:'/node_modules/output-view/package.json', name:'Запрос существующего файла "package.json" в папке "/node_modules/output-view/". (Доступ запрещен)'},
							{link:'/wp-login.php', name:'Запрос несуществующего файла "/wp-login.php" с несуществующим mime.'},
							{link:'/nice_ports,/Trinity.txt.bak', name:'Запрос несуществующего файла "/nice_ports,/Trinity.txt.bak" с несуществующим mime.'},
						]
					}
				})
			);
		}

		if (myConfig.data.isDebug) console.timeEnd('app');
	});
};
//Создаем и запускаем сервер для задачи
var server = http.createServer(app);
server.listen(myConfig.data.port);
//Отображаем информацию о старте сервера
if (myConfig.data.isDebug) console.log('Server start on port ' + myConfig.data.port + ' ...');
