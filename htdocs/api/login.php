<?php
require 'db.php';

// Recebe o JSON do Angular
$data = json_decode(file_get_contents("php://input"));

if(isset($data->email) && isset($data->senha)) {
    $email = $data->email;
    $senha = $data->senha; // Senha digitada (texto puro)

    // Busca o usuário pelo email
    $stmt = $pdo->prepare("SELECT id, nome, email, senha FROM usuarios WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    // === VERIFICAÇÃO DO HASH ===
    // Se o usuário existe E a senha digitada bate com o hash do banco
    if ($user && password_verify($senha, $user['senha'])) {
        
        // Remove a senha do array antes de enviar de volta pro Angular (Segurança)
        unset($user['senha']);
        
        echo json_encode(["success" => true, "user" => $user]);
    } else {
        echo json_encode(["success" => false, "message" => "Email ou senha incorretos"]);
    }
} else {
    echo json_encode(["success" => false, "message" => "Dados incompletos"]);
}
?>