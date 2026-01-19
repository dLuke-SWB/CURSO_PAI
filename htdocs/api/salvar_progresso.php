<?php
require 'db.php';

$data = json_decode(file_get_contents("php://input"));

if(isset($data->usuario_id) && isset($data->curso_id) && isset($data->aula_id)) {
    
    // Insere ou ignora se já existir (devido à chave UNIQUE que criamos)
    $sql = "INSERT IGNORE INTO progresso (usuario_id, curso_id, aula_id) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    
    if($stmt->execute([$data->usuario_id, $data->curso_id, $data->aula_id])) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["success" => false, "message" => "Erro ao salvar"]);
    }
}
?>