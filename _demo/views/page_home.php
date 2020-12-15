<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title><?=$title?></title>
    <script src="/js/jquery-3.4.0.min.js"></script>
    <link href="/css/style.css" rel="stylesheet">
    <script src="/js/app.js"></script>
</head>
    <div><a href="/">МЕНЮ</a></div>
    <br />
    <br />
    <h2 class="title">Выберите тест</h2>
    <?php foreach($tests as $key=>$test): ?>
    <div class="menu_item"><?=$key*1+1?>. <a href="<?=$test.link?>"><?=$test.name?></a></div>
    <?php endforeach; ?>
<body>
</body>
</html>
