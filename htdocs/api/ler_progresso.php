<?php
require 'db.php';

// Recebe o ID do usuário via GET (ex: ler_progresso.php?usuario_id=1)
if(isset($_GET['usuario_id'])) {
    $uid = $_GET['usuario_id'];

    // Busca todas as aulas concluídas por esse usuário
    $stmt = $pdo->prepare("SELECT curso_id, aula_id FROM progresso WHERE usuario_id = ?");
    $stmt->execute([$uid]);
    $progresso = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($progresso);
}
?>