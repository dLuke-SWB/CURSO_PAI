<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->token)) {
    $idToken = $data->token;

    // 1. Validar o token direto com o Google (Segurança)
    $url = "https://oauth2.googleapis.com/tokeninfo?id_token=" . $idToken;
    $response = file_get_contents($url);
    $payload = json_decode($response);

    if(isset($payload->email)) {
        $email = $payload->email;
        $nome = $payload->name;
        // $foto = $payload->picture; // Se quiser salvar a foto depois

        // 2. Verificar se já existe no banco
        $stmt = $pdo->prepare("SELECT id, nome, email FROM usuarios WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if($user) {
            // === CENÁRIO A: JÁ EXISTE -> LOGIN ===
            echo json_encode(["success" => true, "user" => $user, "action" => "login"]);
        } else {
            // === CENÁRIO B: NÃO EXISTE -> CADASTRAR ===
            // Gera uma senha aleatória segura (o usuário não saberá, pois usa Google)
            $randomPass = bin2hex(random_bytes(16));
            $senhaHash = password_hash($randomPass, PASSWORD_ARGON2ID);

            $sql = "INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)";
            $insert = $pdo->prepare($sql);
            
            if($insert->execute([$nome, $email, $senhaHash])) {
                // Busca o ID que acabou de ser criado
                $newId = $pdo->lastInsertId();
                $newUser = ["id" => $newId, "nome" => $nome, "email" => $email];
                
                echo json_encode(["success" => true, "user" => $newUser, "action" => "register"]);
            } else {
                echo json_encode(["success" => false, "message" => "Erro ao criar usuário Google"]);
            }
        }
    } else {
        echo json_encode(["success" => false, "message" => "Token inválido"]);
    }
}
?>