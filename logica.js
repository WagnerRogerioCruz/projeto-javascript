const definicoesStatus = new Map([
    ['aprovado', 'Aprovado'],
    ['recuperacao', 'Em Recuperação'],
    ['reprovado-por-frequencia', 'Reprovado por frequência'],
    ['reprovado-por-nota', 'Reprovado por nota'],
    ['reprovado-por-frequencia-e-nota', 'Reprovado por frequência e nota']
])


function verificaDados(nAluno, nResponsavel, nTelefone, nEmail, nNota1, nNota2, nNota3, nPresenca, nAulasTotais) {

    if (!nAluno.trim() || !nResponsavel.trim() || !nTelefone.trim() || !nEmail.trim()) {
        throw new Error("Preencha todos os campos!");
    }

    if (isNaN(nNota1) || isNaN(nNota2) || isNaN(nNota3) || isNaN(nPresenca) || isNaN(nAulasTotais)) {
        throw new Error("Por favor, preencha os campos notas, presença e aulas totais com números!");
    }

    if (nNota1 < 0 || nNota2 < 0 || nNota3 < 0) {
        throw new Error("Por favor, preencha os campos com uma nota válida!");
    }

    if (nNota1 > 10 || nNota2 > 10 || nNota3 > 10) {
        throw new Error("Por favor, preencha os campos com uma nota válida!");
    }

    if (nPresenca < 0 ) {
        throw new Error("Presença deve ser maior ou igual a zero!");
    }

    if (nAulasTotais <= 0) {
        throw new Error("Total de aulas deve ser maior que zero!");
    }

    if (nPresenca < 0 || nAulasTotais < 0) {
        throw new Error("Presença e total de aulas deve ser maior que zero!");
    }

    if (nAulasTotais > 80) {
        throw new Error("Total de aulas não pode ser maior que 80!");
    }

    if (nPresenca > nAulasTotais) {
        throw new Error("Presença não pode ser maior que o total de aulas!");
    }
    // PROCESSAMENTO (Se passou pelo código acima, permanece seguro)

}

function calcularMedia(nota1, nota2, nota3) {
    const peso1 = 2;
    const peso2 = 3;
    const peso3 = 5;

    const somaPesos = peso1 + peso2 + peso3
    const soma = (nota1 * peso1) + (nota2 * peso2) + (nota3 * peso3)

    return soma / somaPesos
}

function calcularFrequencia(totalPresenca, totalAulas){
    return (totalPresenca / totalAulas) * 100
}

function verificarAprovacao(media, frequencia) {

    // 1. Classificações independentes
    let classeN = ''
    if (media >= 6) classeN = 'aprovado'
    else if (media >= 4) classeN = 'recuperacao'
    else classeN = 'reprovado'

    let classeF = frequencia >= 75 ? 'aprovado' : 'reprovado'

    // 2. Decisão final (status)
    let status = ''
    let statusS = ''

    if (frequencia < 75 && media < 4) {
        statusS = 'reprovado-por-frequencia-e-nota'
    }
    else if (frequencia < 75) {
        statusS = 'reprovado-por-frequencia'
    }
    else if (media >= 6) {
        statusS = 'aprovado'
    }
    else if (media >= 4) {
        statusS = 'recuperacao'
    }
    else {
        statusS = 'reprovado-por-nota'
    }

    // 3. Retorno único
    return {
        statusS,
        classeN,
        classeF
    }
}

function avaliarAluno(nota1, nota2, nota3, totalPresenca, aulasTotais, bonus = 0) {
    const mediaSemBonus = calcularMedia(nota1, nota2, nota3)
    const media = Math.min(10, mediaSemBonus + bonus)
    const frequencia = calcularFrequencia(totalPresenca, aulasTotais)
    const resultado = verificarAprovacao(media, frequencia)
    const conceito = calcularConceito(media)

    return {
        media,
        frequencia,
        statusS: resultado.statusS,
        classeF: resultado.classeF,
        classeN: resultado.classeN,
        conceito
    }
}

function calcularConceito(media) {
    let conceito = ''

    switch (true) {
        case media >= 9,5:
            conceito = 'A'
            break
        case media >= 8:
            conceito = 'B'
            break
        case media >= 6:
            conceito = 'C'
            break
        case media >= 4:
            conceito = 'D'
            break
        default:
            conceito = 'E'
    }

    return conceito
}


