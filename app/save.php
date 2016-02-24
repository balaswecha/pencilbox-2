<?php

function redirect($url = '/') {
    header('HTTP/1.1 302 Found');
    header("Location: $url");
}
if($_SERVER['REQUEST_METHOD'] !== 'POST') {
    redirect();
    exit;
}

$quizJson = json_decode(file_get_contents('php://input'), true);
$grade = $quizJson['grade'];
$subject = $quizJson['subject'];
$chapter = $quizJson['chapter'];
$fileName = "json/$grade/$subject/$chapter.json";

if(file_exists($fileName)) {
    $existingJson = json_decode(file_get_contents($fileName));
} else {
    $existingJson = array();
}
$quizJson['quiz']['type'] = 'quiz';
array_push($existingJson, $quizJson['quiz']);
file_put_contents($fileName, json_encode($existingJson));
header('HTTP/1.1 201 Created');
header('Content-Type: application/json');
echo json_encode($quizJson);
/*
 * {grade:, subject: chapter: quiz: {}}
 */
?>
