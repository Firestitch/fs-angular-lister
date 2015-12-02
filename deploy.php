<?

// wget -N https://raw.githubusercontent.com/Firestitch/angular-boilerplate/master/deploy.php

error_reporting(E_ALL);
ini_set('display_errors', 1);
date_default_timezone_set('America/Toronto');

$pid = @file_get_contents("process.pid");
if($pid) {
        exec("kill ".$pid);
}

@unlink("process.pid");
@mkdir("deploys");
$build = @$_GET["build"] ? $_GET["build"] : (@$argv[1] ? $argv[1] : "development");

if(!@$argv && @file_get_contents("php://input")) {
  $cmd = "php deploy.php ".$build." > deploys/".date("Y-m-d\TH:i:s")." 2>&1 & echo $!";
  $pid = shell_exec($cmd);
  die("Process: ".$pid."\nBuild: ".$build."\nDate: ".date("Y-m-dTH:i:s"));
}

file_put_contents("process.pid",getmypid());
$commands = array('echo $PWD',
                  'echo $PATH',
                  'bower install 2>&1',
                  'git fetch --all 2>&1',
                  'git reset --hard origin/master 2>&1',
                  'git pull 2>&1',
                  'git status 2>&1',
                  'grunt build:'.$build.' --nomin',
                  'rm -f process.pid',
                  'chown -R apache:apache dist'
                  );
?>
<!DOCTYPE HTML>
<html lang="en-US">
<head>
        <meta charset="UTF-8">
</head>
<body style="background-color: #000000; color: #FFFFFF; font-weight: bold; padding: 0 10px; font-family: monospace;">
  
  <h1>Building <?=ucwords($build)?></h1>
  <script src="//code.jquery.com/jquery-1.11.3.min.js"></script>
  <script>
      var down = function() {
        setTimeout(function() {
          if($("#done").length) return;
          $('html, body').animate({scrollTop: $(document).height()}, 'slow');
          down();
        },500);   
      }
      down();
  </script>  
<? foreach($commands AS $command) { ?>

        <div style="color: #6BE234;">$</span> <span style="color: #729FCF;"><?=$command?></div>

        <? @ob_flush() ?>
        <? flush() ?>
<?
$descriptorspec = array(
   0 => array("pipe", "r"),   // stdin is a pipe that the child will read from
   1 => array("pipe", "w"),   // stdout is a pipe that the child will write to
   2 => array("pipe", "w")    // stderr is a pipe that the child will write to
);
flush();
$process = proc_open($command, $descriptorspec, $pipes, realpath('./'));
echo "<pre>";
if (is_resource($process)) {
    while ($s = fgets($pipes[1])) {
        print htmlentities(preg_replace("/\[\d+m/",'',$s));
        @ob_flush();
        flush();
    }
}
echo "</pre>";

?>

        <? @ob_flush() ?>
        <? flush() ?>
<? } ?>
<h1 id="done">Done <?=ucwords($build)?> Build!</h1>
</body>
</html>
