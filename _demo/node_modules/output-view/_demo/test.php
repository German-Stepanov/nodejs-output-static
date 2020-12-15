<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Пример</title>
        <style>
			body {
				font-family:'Lucida Console', Monaco, monospace
			}
			/*Жирный шрифт*/
			.bold {
				font-weight:bold
			}
			/*Серый шрифт*/
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