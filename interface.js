// 1. cria o Array
const cadastroEduTech = [];

//Variável global (estado do sistema) cria um “estado global” da interface Guarda quem está ativo para gamificação
let alunoSelecionado = null

// 2. carrega os dados salvos
carregarDados();

// 3. atualiza a tela
atualizarLista();

// 4. registra eventos
// 4.1 resgistra evendo do modo professor/aluno
document.getElementById("modo").addEventListener("change", aplicarModo)

//4.2 capturando dados do formulário com uso de  event.preventDefault()
document.getElementById("formCadastro").addEventListener("submit", function(event) {
    event.preventDefault()

    cadastroEstudante()
})

//4.3 capturando dados da busca de alunoi
document.getElementById("busca").addEventListener("input", atualizarLista)

aplicarModo()

//inserindo dados no map() caso nao ocorram erros
function cadastroEstudante() {

    try {

        // 1. Coleta de dados
        let aluno = document.getElementById("nomeAluno").value.toLowerCase().trim()
        let responsavel = document.getElementById("nomeResponsavel").value.toLowerCase().trim()
        let telefone = document.getElementById("telefoneResponsavel").value
        let email = document.getElementById("emailResponsavel").value.toLowerCase().trim()
        let nota1 = parseFloat(document.getElementById("nota1").value)
        let nota2 = parseFloat(document.getElementById("nota2").value)
        let nota3 = parseFloat(document.getElementById("nota3").value)
        let presenca = Number(document.getElementById("aulasPresente").value)
        let aulasTotais = Number(document.getElementById("aulasTotais").value)

        // 2. Camada de lógica
        // Se a função verificaDados disparar um throw, o código pula direto para o catch
        const verificacao = verificaDados(aluno, responsavel, telefone, email, nota1, nota2, nota3, presenca, aulasTotais)
        
        // 3. Sucesso! (só executa se não deu erro acima)
        cadastroEduTech.push({
            nome: aluno,
            responsavel,
            telefone,
            email,
            nota1,
            nota2,
            nota3,
            presenca,
            aulasTotais,
            bonus: 0
        })

        console.log(cadastroEduTech)

        limpaFormulario()
        mostrarPopup("✅ Inclusão efetuada")
        salvarDados()
        atualizarLista()
    }
    catch (erro) {
        // 4. Tratamento de erros
        console.error("Erro capturado:", erro); // Log do desenvolvedor

        mostrarPopup(`❌ ${erro.message}`, "erro")
    }
    finally {
        // Opcional: Código roda sempre, independente de sucesso ou erro
        console.log("Tentativa de cadastro finalizada!");
    }
  
}

function mostrarPopup(mensagem, tipo = "sucesso") {
    let popup = document.getElementById("popup")

        if (!popup) {
        console.error("Elemento #popup não encontrado")
        return
    }

    popup.classList.add("popup") // garante classe base

    popup.textContent = mensagem
    popup.classList.remove("erro")

    if (tipo === "erro") {
        popup.classList.add("erro")
    }

    popup.classList.add("mostrar")

    setTimeout(() => {
        popup.classList.remove("mostrar")
    }, 2000)
}

function salvarDados() {
    localStorage.setItem("cadastroEduTech", JSON.stringify(cadastroEduTech))
}

function carregarDados() {
    const dados = localStorage.getItem("cadastroEduTech")

    if (dados) {
        cadastroEduTech.length = 0 // limpa o array

        const array = JSON.parse(dados)

        array.forEach(aluno => {

            // Se não existir bônus, cria com valor zero
            if (aluno.bonus === null || aluno.bonus === undefined) {
                aluno.bonus = 0
            }

            cadastroEduTech.push(aluno)
        })
    }

    console.log(cadastroEduTech)
}

function limpaFormulario() {
        // limpa os campos e posiciona o cursor no campo nome do aluno
        document.getElementById("nomeAluno").value = ""
        document.getElementById("nomeResponsavel").value = ""
        document.getElementById("telefoneResponsavel").value = ""
        document.getElementById("emailResponsavel").value = ""
        document.getElementById("nota1").value = ""
        document.getElementById("nota2").value = ""
        document.getElementById("nota3").value = ""
        document.getElementById("aulasPresente").value = ""
        document.getElementById("aulasTotais").value = ""
        
        //retornar o cursor para primeiro campo do formulario
        document.getElementById("nomeAluno").focus()

}

function atualizarLista() {
    
    const corpo = document.getElementById("corpoTabela")
    let termo = document.getElementById("busca").value.toLowerCase().trim()

    corpo.innerHTML = "" // limpa só a tabela
    
//    let lista = document.getElementById("lista")
//    lista.innerHTML = "" // limpa só a lista
    

    for (const aluno of cadastroEduTech) {

        // FILTRO
        if (!aluno.nome.includes(termo)) continue

        const avaliacao = avaliarAluno(
            aluno.nota1,
            aluno.nota2,
            aluno.nota3,
            aluno.presenca,
            aluno.aulasTotais,
            aluno.bonus
        )

        //busca status de aprovação no Map()
        const statusExtenso = definicoesStatus.get(avaliacao.statusS) ?? "Status desconhecido" //Evitar erro se a chave não existir no Map

         // ✅ encadeamento opcional e coalescência nula
        const email = aluno.email?.trim() || "E-mail não informado"

        //atribui classe que vai buscar cor no css .aprovado .recuperacao .reprovado
        const classeF = avaliacao.classeF 
        const classeN = avaliacao.classeN
        const classeS = avaliacao.statusS
        
        //atribui icones de acordo com o status de aprovação.
        const icones = {
            'aprovado': '✔️',
            'recuperacao': '⚠️',
            'reprovado-por-nota': '❌',
            'reprovado-por-frequencia': '❌',
            'reprovado-por-frequencia-e-nota': '❌'
        }

        const icone = icones[avaliacao.statusS] || ''

        const tr = document.createElement("tr")

        // EVENTO DE SELEÇÃO conecta: tabela → seleção → gamificação
        tr.addEventListener("click", () => {
            alunoSelecionado = aluno

            document.getElementById("alunoSelecionadoInfo").textContent =
                `Aluno selecionado: ${aluno.nome}`

            mostrarPopup(`Selecionado: ${aluno.nome}`)
        })        

        tr.innerHTML = `
            <td>${aluno.nome}</td>
            <td class="${avaliacao.classeN}">${avaliacao.media.toFixed(2)}</td>
            <td class="${avaliacao.classeF}">${avaliacao.frequencia.toFixed(2)}%</td>
            <td class="${avaliacao.statusS}">${icone} ${statusExtenso}</td>
            <td>${avaliacao.conceito}</td>
            <td>${email}</td>
        `

        corpo.appendChild(tr)

    }
}

function aplicarModo() {
    const modo = document.getElementById("modo").value

    const container = document.querySelector(".container")
    const formulario = document.querySelector(".formulario")
    const gamificacao = document.querySelector(".gamificacao")

    if (modo === "professor") {
        formulario.style.display = "block"
        gamificacao.style.display = "none"

        container.classList.remove("modo-aluno")
        container.classList.add("modo-professor")

    } else {
        formulario.style.display = "none"
        gamificacao.style.display = "block"

        container.classList.remove("modo-professor")
        container.classList.add("modo-aluno")
    }
}

function adivinhar() {
    if (!alunoSelecionado) {
        alert("Selecione um aluno primeiro!")
        return
    }

    // passo 1. Gerar o número secreto
    const numeroSecreto = Math.floor(Math.random() * 20) + 1
    let tentativa = 0
    let chute = 0

    // passo 2. loop while (enquanto eu não adivinhar repete)
    while (chute !== numeroSecreto) {

         // pegando o chute do usuário
        let entrada = prompt(`(${alunoSelecionado.nome}) Adivinhe o numero entre 1 e 20 ou digite 'sair':`)

        if (entrada === null || entrada.toLowerCase() === 'sair') {
            alert('Jogo cancelado! O número era: ' + numeroSecreto);
            return
        }

        chute = Number(entrada)

        //validação do chute , NÃO conta tentativa inválida
        if (isNaN(chute) || chute < 1 || chute > 20) {
            alert("Digite um número válido entre 1 e 20!");
            continue;
        }

        tentativa++ // Incrementa meu contador de tentativas

        if (chute === numeroSecreto) {

            //debug de tentativas
            console.log("Tentativas:", tentativa)

            // define vlr do bonus na media, menos tentativas = bonus maior, recebe no minimo 0,1, nao fica negativo
            let bonus = Math.max(0.1, 1 - tentativa * 0.1) // menos tentativas = bonus maior, recebe no minimo 0,1

            alert(`Parabéns! Você acertou o número ${numeroSecreto} em ${tentativa} tentativas. +${bonus.toFixed(2)} na média!`)

            alunoSelecionado.bonus += bonus

            atualizarLista()
            salvarDados()
        }else {
            alert(chute > numeroSecreto ? "MENOS! O número secreto é menor." : "MAIS! O número secreto é maior.");
        }
    }
}

