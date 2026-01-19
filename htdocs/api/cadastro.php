<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->nome) && isset($data->email) && isset($data->senha)) {
    $nome = $data->nome;
    $email = $data->email;
    $senha = $data->senha; 

    // Verifica se o email já existe
    $check = $pdo->prepare("SELECT id FROM usuarios WHERE email = ?");
    $check->execute([$email]);

    if($check->rowCount() > 0) {
        echo json_encode(["success" => false, "message" => "Este email já está cadastrado."]);
    } else {
        // O PHP gera o 'salt' automaticamente e o inclui no hash final.
        $senhaHash = password_hash($senha, PASSWORD_ARGON2ID);

        // Insere o usuário com a SENHA CRIPTOGRAFADA
        $sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        
        // Note que passamos $senhaHash, não $senha
        if($stmt->execute([$nome, $email, $senhaHash])) {
            echo json_encode(["success" => true, "message" => "Usuário criado com sucesso!"]);
        } else {
            echo json_encode(["success" => false, "message" => "Erro ao cadastrar."]);
        }
    }
} else {
    echo json_encode(["success" => false, "message" => "Dados incompletos."]);
}
?>