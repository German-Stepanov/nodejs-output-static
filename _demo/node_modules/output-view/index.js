var Output = function (config) {
	//Текущий объект
	var self = this;

	//Формируем конфигурацию
	config = config || {};
	//Расположение папки отображений относительно папки node_modules
	config.dir 		= config.dir==null ? require('path').dirname(require.main.filename) : config.dir;	
	//Режим отладки
	config.isDebug  = config.isDebug==null ? false : Boolean (config.isDebug);
	//Очищать код
	config.clear = config.clear==null || config.isDebug ? false : Boolean (config.clear);
	
	this.dir = config.dir==null ? require('path').dirname(require.main.filename) : config.dir;
	
	this.error = function (text) {
		return '<div style="color:red">ERROR OUTPUT: <b>' + text + '</b></div>';
	};
	this.debug = function (text) {
		//console.log([text]);
		text = text
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/\n/g, '<br/>')
			.replace(/\\r\\n/g, '<br/>')
			.replace(/([^\\t]*?)\\t/g, function (s, STR, POS) {
				return STR + (new Array(4 - (STR.length + 4 ) % 4 + 1)).join(' ');
			})
			.replace(/\\"/g, '"')
			.replace(/\\'/g, "'")
			//.replace(/\\t/g, '&nbsp;')
			.replace(/ /g, '&nbsp;');
		
		return '<div style="color:blue">debug OUTPUT: ' + text + '</div>';
	};
	//Коллекция регулярных выражений
	this.re = {
		html_php 		: /((?!<\?)[\s\S]+?)?(<\?[\s\S]*?\?>|$)/g,
		if				: /<\?(?:php)? +if *\(([\s\S]+?)\) *: *\?>$/,
		elseif			: /<\?(?:php)? +elseif *\(([\s\S]+?)\) *: *\?>$/,
		else			: /<\?(?:php)? +else *: *\?>$/,
		endif			: /<\?(?:php)? +endif[\s\S]*\?>$/,
		foreach			: /<\?(?:php)? +foreach *\( *([^ ]+?) +as +([^= ]+?) *=> *([^) ]+?) *\) *\: *\?>$/,
		endforeach		: /<\?(?:php)? +endforeach[\s\S]*\?>$/,
		for				: /<\?(?:php)? +for *\(([^;]+?);([^;]+?);([^)]+?)\) *\: *\?>$/,
		endfor			: /<\?(?:php)? +endfor[\s\S]*\?>$/,
		while			: /<\?(?:php)? +while *\(([\s\S]+?)\) *: *\?>$/,
		endwhile		: /<\?(?:php)? +endwhile[\s\S]*\?>$/,
		expression		: /(<\?)((?:php)?)(=?)([\s\S]*?)((?:\?>))$/,
		styles			: /(<style\s*(?:[^>]*?)>)([\s\S]*?)(<\/style>)/g,
		scripts			: /(<script\s*(?:[^>]*?)>)([\s\S]*?)(<\/script>)/g,
		comments_html 	: /<!--((?!<!--)[\s\S]*?)-->/g,
		comments_stars 	: /\/\*[\s\S]*?\*\//g,
		comments_slash 	: /(\/\/[^'"]+?)(?:\r|$)/g,
		spaces			: /\s+/g,
	};
	
	
	this.view = function (params) {
		//Параметры по-умолчанию
		params = params || {};
		params.file 	= params.file || '';
		params.text 	= params.text || '';
		params.data 	= params.data || {};

		//Проверяем существование
		if (params.file && !require('fs').existsSync(self.dir + params.file)) {
			return self.error('Не найден файл "' + self.dir + params.file + '"');
		}
		
		//Первоначальный код
		var input 		= '';
		//Окончательный код
		var output 		= '';
		//Найденные блоки
		var blocks		= [];
		//Условия
		var conditions  = [];
		//Циклы
		var loops		= [];
		//Возвращает итоговое условие выполнения кода
		var total_conditions = function (conditions) {
			return (conditions.length==0) ? (true) : (eval(conditions.join(' && ')));
		};

		//Считывание файла или текста
		if (params.file) {
			try {
				input = require('fs').readFileSync(config.dir + params.file, 'utf8');
			} catch (e) {
				return self.error(['Ошибка чтения файла "' + self.dir + params.file + '"', e.toString()].join(': '));
			};
		} else {
			input = params.text + '';
		};

		//Определение пользовательских переменных
		var variable_names = Object.keys(params.data);
		for (var i in variable_names) {
			if (typeof(params.data[variable_names[i]])=='function') {
				//Определяем функцию
				var expression = 'var ' + variable_names[i] + ' = ' + params.data[variable_names[i]] + ';';
			} else {
				//Определяем переменную
				var expression = 'var ' + variable_names[i] + ' = ' + JSON.stringify(params.data[variable_names[i]]) + ';';
			};
			//Формируем переменную или функцию
			try {
				eval(expression);
			} catch (e) {
				return self.error(['Ошибка назначения переменной в выражении "' + expression + '"', e.toString()].join(': '));
			};
		};

		if (config.isDebug) output += self.debug(['Входные данные params.data', JSON.stringify(params.data, null, 4)].join(': '));

		if (input) {
			//Разбираем код на блоки
			if (config.isDebug) output += self.debug(['Разбираем код на блоки...'].join(': '));
			
			//Извлекаем блок кода (с кодом html и php)
			var result = input.replace(self.re['html_php'], function (s, html, php) {
				//Если код не пустой
				if (html) {
					blocks.push({
						type	: 'html',
						text	: s,
						html	: html,
					});
				};
				//Если код не пустой
				if (php) {	
				
					//Извлекаем из кода php "if"
					php = php.replace(self.re['if'], function (s, condition) {
						blocks.push ({
							type		: 'if',
							text		: s,
							condition	: condition,
						})
						return '';//удаляем найденый код
					});
					if (!php) return ''; //удаляем код блока PHP
					
					//Извлекаем из кода php "elseif"
					php = php.replace(self.re['elseif'], function (s, condition) {
						blocks.push ({
							type		: 'elseif',
							text		: s,
							condition	: condition,
						})
						return '';//удаляем найденый код
					});
					if (!php) return ''; //удаляем код блока PHP
					
					//Извлекаем код "else"
					php = php.replace(self.re['else'], function (s) {
						blocks.push ({
							type	: 'else',
							text	: s,
						})
						return '';//удаляем найденый код
					});
					if (!php) return ''; //удаляем код блока PHP
					
					//Извлекаем код "endif"
					php = php.replace(self.re['endif'], function (s) {
						blocks.push ({
							type	: 'endif',
							text	: s,
						})
						return '';//удаляем найденый код
					});
					if (!php) return ''; //удаляем код блока PHP
					
					//Извлекаем код "foreach"
					php = php.replace(self.re['foreach'], function (s, obj_name, key_name, value_name) {
						blocks.push ({
							type		: 'foreach',
							text		: s,
							obj_name 	: obj_name,
							key_name	: key_name,
							value_name	: value_name,
						})
						return '';//удаляем найденый код
					});
					if (!php) return ''; //удаляем код блока PHP

					//Извлекаем код "endforeach"
					php = php.replace(self.re['endforeach'], function (s) {
						blocks.push ({
							type		: 'endforeach',
							text		: s,
						})
						return '';//удаляем найденый код
					});
					if (!php) return ''; //удаляем код блока PHP
					
					//Извлекаем код "for"
					php = php.replace(self.re['for'], function (s, first, limit, next) {
						blocks.push ({
							type	: 'for',
							text	: s,
							first 	: first,
							limit	: limit,
							next	: next,
						})
						return '';//удаляем найденый код
					});
					if (!php) return ''; //удаляем код блока PHP
					
					//Извлекаем код "endfor"
					php = php.replace(self.re['endfor'], function (s) {
						blocks.push ({
							type	: 'endfor',
							text	: s,
						})
						return '';//удаляем найденый код
					});
					if (!php) return ''; //удаляем код блока PHP
					
					//Извлекаем код "while"
					php = php.replace(self.re['while'], function (s, limit) {
						blocks.push ({
							type	: 'while',
							text	: s,
							limit	: limit,
						})
						return '';//удаляем найденый код
					});
					if (!php) return ''; //удаляем код блока PHP
					
					//Извлекаем код "endwhile"
					php = php.replace(self.re['endwhile'], function (s) {
						blocks.push ({
							type	: 'endwhile',
							text	: s,
						})
						return '';//удаляем код
					});
					if (!php) return ''; //удаляем код блока PHP
					
					//Извлекаем код "expression"
					php = php.replace(self.re['expression'], function (s, php_quote_left, php_php, php_equal, php_code, php_quote_right) {
						blocks.push({
							type		: 'expression',
							text		: s,
							quote_left 	: php_quote_left,
							php 		: php_php,
							equal 		: php_equal=='=',
							code 		: php_code,
							quote_right : php_quote_right,
						});
						return ''; //удаляем найденый код
					});
					if (!php) return ''; //удаляем код блока PHP
					
					//Неизвестный код
					//Деактивируем теги PHP
					var html = php.replace(/<\?/g, '&lt;?').replace(/\?>/g, '?&gt;');
					//Добавление блоком
					blocks.push({
						type	: 'html',
						text	: php,
						html	: html,
					});
					//Сообщение об ошибке
					var line = input.split(php).shift().split('\r\n').length;
					return self.error([(params.file) ? ('Файл "' + params.file + '"') : (''), 'cтрока "' + line + '"', 'Не определен код "' + php + '"'].join(': '));
				};
				return ''; //удаляем код блока HTML и PHP
			});

			if (config.isDebug) output += self.debug(['Сформированы блоки', JSON.stringify(blocks, null, 4)].join(': '));
			
			//Перебор блоков (используем ТОЛЬКО цикл for для формирования переменных в пространстве окружения)
			if (config.isDebug) output += self.debug(['Перебор блоков...'].join(': '));
	
			for (var i=0; i<blocks.length; i++) {
				
				if (config.isDebug) output += self.debug(['block[' + i + ']=' + JSON.stringify(blocks[i], null, 4)].join(': '));
				//if (config.isDebug) console.log(['DEBUG','block[' + i + ']=' + JSON.stringify(blocks[i], null, 4)].join(': '));
				
				try {
					switch (blocks[i].type) {
						case 'html':
							if (total_conditions(conditions)) {
								output += blocks[i].html;
							};
						break;
						
						case 'expression':
							if (total_conditions(conditions)) {
								//Выполняем выражение
								var result = eval(blocks[i].code);
								//Заменяем теги <?php ?> <? ?> или <?=?> значениями выражений
								output += (blocks[i].equal) ? (result) : ('');
							};
						break;
						
						case 'if':
							//Если все условия выполнены
							if (total_conditions(conditions)) {
								//Добавляем условие 
								conditions.push(Boolean (eval(blocks[i].condition)));
							} else {
								//Запрет выполнения кода
								conditions.push(false);
							};
						break;

						case 'elseif':
							if (conditions.length==0) {
								//Игнорируем код с ошибкой
								throw 'Error: Неожиданное появление elseif';
							};
							//Извлекаем последнее условие
							var condition = conditions.pop();
							//Новое условие - из выражения
							var condition_new = Boolean (eval(blocks[i].condition));
							
							//Если все условия за исключением последнего выполнены
							if (total_conditions(conditions) && ! condition) {
								//Добавляем новое условие 
								conditions.push(condition_new);
							} else {
								//Запрет выполнения кода
								conditions.push(false);
							};
						break;
						
						case 'else':
							if (conditions.length==0) {
								//Игнорируем код с ошибкой
								throw 'Error: Неожиданное появление else';
							};
							//Извлекаем последнее условие
							var condition = conditions.pop();
							//Новое условие - противоположное последнему
							var condition_new = ! condition;
							
							//Если все условия за исключением последнего выполнены
							if (total_conditions(conditions) && ! condition) {
								//Добавляем новое условие 
								conditions.push(condition_new);
							} else {
								//Запрет выполнения кода
								conditions.push(false);
							};
							//conditions[Object.keys(conditions).length-1] = ! conditions[Object.keys(conditions).length-1];
						break;
						
						case 'endif':
							if (conditions.length==0) {
								//Игнорируем код с ошибкой
								throw 'Error: Неожиданное появление endif';
							};
							conditions.pop();
						break;

						case 'for':
						case 'while':
						case 'foreach':
							//Формируем новый loop
							if (blocks[i].type=='for') {
								var loop = {
									'type'	: 'for',
									'block' : i,
									'first' : 'var ' + blocks[i].first + ';',
									'limit'	: blocks[i].limit,
									'next' 	: blocks[i].next + ';',
								};
							} else if (blocks[i].type=='while') {
								var loop = {
									'type'	: 'while',
									'block'	: i,
									'first'	: '',
									'limit'	: blocks[i].limit,
									'next'	: '',
								};
							} else if (blocks[i].type=='foreach') {
								var loop = {
									'type'			: 'foreach',
									'block' 		: i,
									'first'			: 'var ' + blocks[i].key_name + '=Object.keys(' + blocks[i].obj_name + ')[0];' + 'var ' + blocks[i].value_name + '=' + blocks[i].obj_name + '[' + blocks[i].key_name + '];',
									'limit'			: blocks[i].key_name + '!=null',
									'next'			: 'var ' + blocks[i].key_name + '= Object.keys(' + blocks[i].obj_name + ')[Object.keys(' + blocks[i].obj_name + ').indexOf(' + blocks[i].key_name + ') + 1];' + 'var ' + blocks[i].value_name + '=' + blocks[i].obj_name + '[' + blocks[i].key_name + '];',
								};
							};
							//Добавляем цикл
							loops.push(loop);
							//Если все условия выполнены
							if (total_conditions(conditions)) {
								//Объявляем переменные цикла
								eval(loop.first);
								//Добавляем условие выполнения тела цикла
								conditions.push(eval(loop.limit));
							} else {
								//Не выполняем тело цикла
								conditions.push(false);
							};
						break;
						
						case 'endfor':
						case 'endwhile':
						case 'endforeach':
							//Итерация. Считываем последний цикл
							var loop = loops[Object.keys(loops).length - 1];
							if (!loop || 'end' + loop.type!=blocks[i].type) {
								throw 'Error: Неожиданное появление ' + blocks[i].type;
							};
							//Если все условия выполнены
							if (total_conditions(conditions)) {
								//Изменяем переменные цикла
								eval(loop.next);
								//Проверяем условие продолжения цикла
								if (eval(loop.limit)) {
									//повтор тела цикла
									i = loop.block;
								} else {
									//Завершаем цикл и условие цикла
									loops.pop();
									conditions.pop();
								};
							} else {
								//Завершаем цикл и условие цикла
								loops.pop();
								conditions.pop();
							};
						break;
					};
				} catch (e) {
					//Определяем строку блока
					var line = input.split(blocks[i].text).shift().split('\r\n').length;
					//Выводим ошибку
					return self.error([(params.file) ? ('Файл "' + params.file + '"') : (''), 'cтрока "' + line + '"', e.toString()].join(': '));
					//Завершаем цикл
					i = blocks.length;
					break;
				};
			};
			
		};
		
		if (loops.length>0) {
			return self.error([(params.file) ? ('Файл "' + params.file + '"') : (''),'Циклы не завершены'].join(': '));
		};
		
		if (conditions.length>0) {
			return self.error([(params.file) ? ('Файл "' + params.file + '"') : (''),'Условные операторы не завершены'].join(': '));
		};

		//Очистка кода
		if (config.clear) {
			//Удаление комментариев <!-- --> в html
			output = output.replace(self.re['comments_html'], '');
			//Поиск стилей
			output = output.replace(self.re['styles'], function (s, a1, a2, a3) {
				//Удаление комментариев /**/
				a2 = a2.replace(self.re['comments_stars'], '');
				return a1 + a2 + a3;
			});
			//Поиск скриптов
			output = output.replace(self.re['scripts'], function (s, a1, a2, a3) {
				//Удаление комментариев // (применять первым и осторожно! можно удалить http://)
				a2 = a2.replace(self.re['comments_slash'], '');
				//a2 = a2.replace(/(^|\s+|;)(?:\/\/[^\r\n]*?)(\r\n|$)/g, '$1$2');
				//Удаление комментариев /**/
				a2 = a2.replace(self.re['comments_stars'], '');
				return a1 + a2 + a3;
			});
			//Удаление лишних пробелов и переносов строк
			output = output.replace(self.re['spaces'], ' ');
		};
		return output;
	};
};
module.exports = function (config) {
	return new Output(config);
};
