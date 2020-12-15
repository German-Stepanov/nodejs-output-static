/*
Пример статического файла JS
*/
//Тестовые строки
var a = 'https://www.google.com'; //Комментарий
var b = "https://www.google.com"; //Комментарий
$(document).ready(function(e) {
	$('img').css('opacity', 0.3);
	$('img').on('mouseenter', function(e) {
		$(this).css('opacity', 1.0);
	});
	$('img').on('mouseout', function(e) {
		$(this).css('opacity', 0.3);
	});
});