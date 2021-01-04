var Static = function (config) {
	//Формируем конфигурацию
	this.config = config || {};
	//Файлы и папки, запрещенные для скачивания
	this.config.forbidden 	= this.config.forbidden || [];
	//Очищаемые файлы
	this.config.clear 		= this.config.clear || [];
	//Список mime
	this.config.mime 		= this.config.mime || {};
	//Флаг отладки
	this.config.isDebug		= this.config.isDebug==null ? false : Boolean(this.config.isDebug);

	this.errors = {
		1 : 'FILE_EXT_NOT_FOUND',
		2 : 'MIME_NOT_FOUND',
		3 : 'FILE_NOT_FOUND',
		4 : 'ACCESS_FORBIDDEN',
	}
	//Запуск фильтрации запросов статических ресурсов
	this.filter = function (req, res, next) {
		//запрашиваемый ресурс и расширение
		var file = req.url.split('?').shift(); //Отсекаем от ресурса псевдопараметры (если есть)
		//Расширение
		var ext = require('path').extname(file).toLowerCase();
		//Нет расширения 
		if (!ext) return next({code:1}); 
		//Не найдено mime
		if ( !this.config.mime[ext]) return next({code:2});
		//Не найден файл
		if ( !require('fs').existsSync('./' + file)) return next({code:3});
		//Запрещенный ресурс
		for (var i in this.config.forbidden) {
			if ((file.toLowerCase()).indexOf((this.config.forbidden[i]+'').toLowerCase())==0) {
				return next({code:4});
			};
		};
		
		//Очистка файлов js и css от комментариев, лишних пробелов, и переносов строк
		if (this.config.clear.indexOf(file)!=-1 && ['.js', '.css'].indexOf(ext)!=-1) {
			//Считываем файл
			var output = require('fs').readFileSync('./' + file, 'utf8');
			//Удаление комментариев /**/
			output = output.replace(/\/\*[\s\S]*?\*\//g, '');
			//Удаление комментариев // в скриптах
			if (ext=='.js') output = output.replace(/(\/\/[^'"]+?)(?:\r|$)/g, '');
			//Удаление лишних пробелов и переносов строк
			output = output.replace(/\s+/g, ' ');
			//Отправляем файл
			res.writeHead(200, {'Content-Type':this.config.mime[ext]});
			res.end(output);
			return next();
		};	

		//Размер файла
		var fileSize = require('fs').statSync('./' + file).size;

		var head = {
			'Content-Type'	: this.config.mime[ext],
			'Content-Length': fileSize,
		};
		var code 	= 200;
		var start 	= 0;
		var end 	= fileSize - 1;
		
		//Даннные видео-аудио
		if (req.headers.range) {
			var parts = req.headers.range.replace(/bytes=/, "").split("-");
			code = 206;
			start = parseInt(parts[0], 10);
			end = parts[1] ? parseInt(parts[1], 10) : end;
			head['Content-Range'] = 'bytes ' + start + '-' + end + '/' + fileSize;
			head['Accept-Ranges'] = 'bytes';
			head['Content-Length']= (end-start)+1; //Размер части файла
		}
		if (start>end) end = start;
		
		res.writeHead(code, head);
		require('fs').createReadStream('./' + file, {start:start, end:end}).pipe(res);
		next();
	};
	
	var self = this;
};
module.exports = function (config) {
	return new Static(config);
};