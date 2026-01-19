<?php
// Permite que o Angular (localhost:4200) acesse este servidor
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");

$host = 'localhost';
$db   = 'alexandre_db';
$user = 'root'; // No XAMPP padrão é root
$pass = '';     // No XAMPP padrão é vazio

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erro de conexão: " . $e->getMessage());
}
?>