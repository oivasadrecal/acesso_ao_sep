// Dados Padrão Iniciais (conforme solicitação e imagem de referência)
const defaultData = {
    nome: "",
    funcao: "Eletricista de rede aérea",
    matricula: "",
    dataEmissao: "2026-07-06",
    unidade: "GERÊNCIA REGIONAL BAIXADA - OTNB",
    validadeCartao: "2028-05-28",
    autorizadoOperar: "CESTO AÉREO",
    nr33Autorizacao: "SIM",
    nr33Vigia: "NÃO",
    nr33Supervisor: "NÃO",
    nr35Autorizado: "SIM",
    nr35Validade: "2028-05-27",
    observacoes: "Capacitado a realizar atividades de emergência Rede Aérea. E Manobras de rede aérea de MT. Reparo de rede de BT/MT. Leitura de Medidores.",
    responsavelTecnico: "ENG. MARCOS A. SILVA",
    statusValidacao: "VALIDADO", // "VALIDADO" ou "PENDENTE"
    dataValidacao: "2026-07-06 10:30",
    modeloImpressao: "pocket", // "pocket" (Carteira 10x6cm Dobrável), "pvc" (10x6cm Lado a Lado), ou "a4"
    
    // Matriz NR10: [bts, btc, ats, atc] para cada uma das 5 linhas (0 a 4)
    // Linha 2 (Responsável de Trabalho) marcada com X nas 4 colunas conforme foto do usuário
    nr10Matrix: {
        row0: { bts: false, btc: false, ats: false, atc: false },
        row1: { bts: false, btc: false, ats: false, atc: false },
        row2: { bts: true,  btc: true,  ats: true,  atc: true  },
        row3: { bts: false, btc: false, ats: false, atc: false },
        row4: { bts: false, btc: false, ats: false, atc: false }
    }
};

// Colaboradores Pré-registrados no Sistema
const preRegisteredCollaborators = {
    "1008663": "Genaro Ribeiro Costa",
    "1001234": "Hélio Moura Silva",
    "1005678": "Otoni Silva Manford",
    "1009101": "Celso Lima Cordeiro",
    "1001213": "Miguel Avelar Souza",
    "1001415": "Rickson Melo Brito",
    "1001617": "Mouzer Lima Bolder"
};

// Estado Atual da Aplicação
let currentData = loadSavedData();
let excelHistory = loadSavedExcelHistory();

// Carregar dados salvos ou usar padrão
function loadSavedData() {
    const saved = localStorage.getItem("sep_card_admin_data");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (parsed.nome === "SAVIO GALVAO LACERDA FILHO") parsed.nome = "";
            if (parsed.matricula === "4008663") parsed.matricula = "";
            return { ...defaultData, ...parsed };
        } catch (e) {
            console.error("Erro ao ler localStorage", e);
        }
    }
    return JSON.parse(JSON.stringify(defaultData));
}

// Salvar no localStorage
function saveData() {
    localStorage.setItem("sep_card_admin_data", JSON.stringify(currentData));
}

// Histórico da Planilha em LocalStorage
function loadSavedExcelHistory() {
    const saved = localStorage.getItem("sep_excel_history_data");
    if (saved) {
        try {
            let parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                const filtered = parsed.filter(item => item.nome !== "SAVIO GALVAO LACERDA FILHO" && item.matricula !== "4008663");
                if (filtered.length !== parsed.length) {
                    localStorage.setItem("sep_excel_history_data", JSON.stringify(filtered));
                }
                return filtered;
            }
            return parsed;
        } catch (e) {
            console.error("Erro ao ler histórico da planilha", e);
        }
    }
    // Entrada inicial padrão correspondente aos arquivos em doc_acesso_a_rede
    return [{
        timestamp: "2026-08-02 17:35",
        matricula: "",
        nome: "",
        funcao: "Eletricista de rede aérea",
        unidade: "GERÊNCIA REGIONAL BAIXADA - OTNB",
        dataEmissao: "2026-07-06",
        validadeCartao: "2028-05-28",
        nr10Summary: "L2 [BTS,BTC,ATS,ATC]",
        nr10Matrix: {
            row0: { bts: false, btc: false, ats: false, atc: false },
            row1: { bts: false, btc: false, ats: false, atc: false },
            row2: { bts: true,  btc: true,  ats: true,  atc: true  },
            row3: { bts: false, btc: false, ats: false, atc: false },
            row4: { bts: false, btc: false, ats: false, atc: false }
        },
        autorizadoOperar: "CESTO AÉREO",
        nr33Autorizacao: "SIM",
        nr33Vigia: "NÃO",
        nr33Supervisor: "NÃO",
        nr35Autorizado: "SIM",
        nr35Validade: "2028-05-27"
    }];
}

function saveExcelHistory() {
    localStorage.setItem("sep_excel_history_data", JSON.stringify(excelHistory));
    renderExcelHistoryTable();
    renderExpirationAlerts();
}

// Renderizar Tabela de Histórico da Planilha na Página Admin
function renderExcelHistoryTable() {
    const tbody = document.getElementById("excel-history-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    excelHistory.slice().reverse().forEach(record => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${record.timestamp}</strong></td>
            <td>${record.matricula}</td>
            <td>${record.nome}</td>
            <td>${record.funcao}</td>
            <td>${formatDateDisplay(record.validadeCartao)}</td>
            <td>${formatDateDisplay(record.nr35Validade)}</td>
        `;
        tbody.appendChild(tr);
    });
}

// Formatar data AAAA-MM-DD para DD/MM/AAAA
function formatDateDisplay(dateStr) {
    if (!dateStr) return "";
    if (dateStr.includes("/")) return dateStr;
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
}

// Obter resumo formatado das abrangências marcadas na matriz NR10
function getNR10Summary() {
    const matrix = currentData.nr10Matrix;
    let summaryParts = [];
    
    const rowNames = ["Sem Intervenção (0)", "Com Intervenção (1)", "Resp. Trabalho (2)", "Resp. Impedimento (3)", "Zona Livre (4)"];
    
    for (let r = 0; r < 5; r++) {
        const rowKey = `row${r}`;
        if (matrix[rowKey]) {
            let cols = [];
            if (matrix[rowKey].bts) cols.push("BTS");
            if (matrix[rowKey].btc) cols.push("BTC");
            if (matrix[rowKey].ats) cols.push("ATS");
            if (matrix[rowKey].atc) cols.push("ATC");

            if (cols.length > 0) {
                summaryParts.push(`L${r} [${cols.join(",")}]`);
            }
        }
    }

    return summaryParts.length > 0 ? summaryParts.join("; ") : "Nenhuma";
}

// Renderizar Alertas de Expirados e a Vencer
function renderExpirationAlerts() {
    const listContainer = document.getElementById("expiration-alerts-list");
    if (!listContainer) return;

    listContainer.innerHTML = "";

    const expiringRecords = excelHistory.filter(record => {
        const daysNR10 = getDaysUntilExpiration(record.validadeCartao);
        const daysNR35 = getDaysUntilExpiration(record.nr35Validade);
        
        const isNR10Alert = daysNR10 !== null && daysNR10 <= 30;
        const isNR35Alert = daysNR35 !== null && daysNR35 <= 30;
        
        return isNR10Alert || isNR35Alert;
    });

    if (expiringRecords.length === 0) {
        listContainer.innerHTML = `<div class="empty-alerts">✅ Nenhuma credencial a vencer ou vencida.</div>`;
        return;
    }

    expiringRecords.forEach(record => {
        const daysNR10 = getDaysUntilExpiration(record.validadeCartao);
        const daysNR35 = getDaysUntilExpiration(record.nr35Validade);

        let nr10Text = "";
        let nr35Text = "";

        if (daysNR10 !== null && daysNR10 <= 30) {
            if (daysNR10 < 0) {
                nr10Text = `<span class="alert-tag expired">NR10 Vencida há ${Math.abs(daysNR10)} dias</span>`;
            } else if (daysNR10 === 0) {
                nr10Text = `<span class="alert-tag warning">NR10 Vence Hoje</span>`;
            } else {
                nr10Text = `<span class="alert-tag warning">NR10 Vence em ${daysNR10} dias</span>`;
            }
        }

        if (daysNR35 !== null && daysNR35 <= 30) {
            if (daysNR35 < 0) {
                nr35Text = `<span class="alert-tag expired">NR35 Vencida há ${Math.abs(daysNR35)} dias</span>`;
            } else if (daysNR35 === 0) {
                nr35Text = `<span class="alert-tag warning">NR35 Vence Hoje</span>`;
            } else {
                nr35Text = `<span class="alert-tag warning">NR35 Vence em ${daysNR35} dias</span>`;
            }
        }

        const div = document.createElement("div");
        div.className = "alert-item-card";
        div.innerHTML = `
            <div class="alert-item-header">
                <strong>${record.nome}</strong> (Matr: ${record.matricula})
            </div>
            <div class="alert-tags-container">
                ${nr10Text}
                ${nr35Text}
            </div>
        `;
        listContainer.appendChild(div);
    });
}

// Inicialização da Página
document.addEventListener("DOMContentLoaded", () => {
    if (document.getElementById("input-nome")) {
        populateFormFields();
    }
    updateCardPreview();
    renderExcelHistoryTable();
    renderExpirationAlerts();
    setupEventListeners();
});

// Preencher formulário admin com os dados do estado
function populateFormFields() {
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || "";
    };

    setVal("input-nome", currentData.nome);
    setVal("input-funcao", currentData.funcao);
    setVal("input-matricula", currentData.matricula);
    setVal("input-data-emissao", currentData.dataEmissao);
    setVal("input-unidade", currentData.unidade);
    setVal("input-validade-cartao", currentData.validadeCartao);
    setVal("input-autorizado-operar", currentData.autorizadoOperar);
    setVal("input-nr33-autorizacao", currentData.nr33Autorizacao || "NÃO");
    setVal("input-nr33-vigia", currentData.nr33Vigia || "NÃO");
    setVal("input-nr33-supervisor", currentData.nr33Supervisor || "NÃO");
    setVal("input-nr35-autorizado", currentData.nr35Autorizado || "NÃO");
    setVal("input-nr35-validade", currentData.nr35Validade);
    setVal("input-observacoes", currentData.observacoes);
    setVal("input-responsavel-tecnico", currentData.responsavelTecnico);
    setVal("select-print-mode", currentData.modeloImpressao || "pocket");

    // Preencher Checkboxes NR10
    const matrix = currentData.nr10Matrix || defaultData.nr10Matrix;
    for (let r = 0; r < 5; r++) {
        const rowKey = `row${r}`;
        if (matrix[rowKey]) {
            ['bts', 'btc', 'ats', 'atc'].forEach(col => {
                const cb = document.getElementById(`nr10-r${r}-${col}`);
                if (cb) {
                    cb.checked = !!matrix[rowKey][col];
                }
            });
        }
    }
}

// Atualizar visualização do Cartão em tempo real
function updateCardPreview() {
    // Ler valores do formulário se existirem (Modo Admin ou Colaborador)
    if (document.getElementById("input-nome")) {
        const getElVal = (id, defaultVal = "") => {
            const el = document.getElementById(id);
            return el ? el.value : defaultVal;
        };

        currentData.nome = getElVal("input-nome");
        currentData.funcao = getElVal("input-funcao");
        currentData.matricula = getElVal("input-matricula");
        currentData.dataEmissao = getElVal("input-data-emissao");
        currentData.unidade = getElVal("input-unidade");
        currentData.validadeCartao = getElVal("input-validade-cartao");
        currentData.autorizadoOperar = getElVal("input-autorizado-operar");
        currentData.nr33Autorizacao = getElVal("input-nr33-autorizacao", "NÃO");
        currentData.nr33Vigia = getElVal("input-nr33-vigia", "NÃO");
        currentData.nr33Supervisor = getElVal("input-nr33-supervisor", "NÃO");
        currentData.nr35Autorizado = getElVal("input-nr35-autorizado", "NÃO");
        currentData.nr35Validade = getElVal("input-nr35-validade");
        currentData.observacoes = getElVal("input-observacoes");
        currentData.responsavelTecnico = getElVal("input-responsavel-tecnico");
        
        const printSelect = document.getElementById("select-print-mode");
        if (printSelect) {
            currentData.modeloImpressao = printSelect.value;
        }

        // Atualizar matriz NR10 a partir dos checkboxes
        for (let r = 0; r < 5; r++) {
            const rowKey = `row${r}`;
            if (!currentData.nr10Matrix) currentData.nr10Matrix = {};
            if (!currentData.nr10Matrix[rowKey]) currentData.nr10Matrix[rowKey] = {};
            
            ['bts', 'btc', 'ats', 'atc'].forEach(col => {
                const cb = document.getElementById(`nr10-r${r}-${col}`);
                currentData.nr10Matrix[rowKey][col] = cb ? cb.checked : false;
            });
        }
    }

    // Helper para atualizar texto em múltiplos elementos
    const setAllText = (selectorOrId, text) => {
        let els;
        if (selectorOrId.startsWith(".")) {
            els = document.querySelectorAll(selectorOrId);
        } else {
            els = document.querySelectorAll(`#${selectorOrId}, .${selectorOrId}`);
        }
        els.forEach(el => el.textContent = text);
    };

    setAllText("card-nome", currentData.nome || "");
    setAllText("card-funcao", currentData.funcao || "---");
    setAllText("card-matricula", currentData.matricula || "");
    setAllText("card-data-emissao", formatDateDisplay(currentData.dataEmissao));
    setAllText("card-unidade", currentData.unidade || "GERÊNCIA REGIONAL BAIXADA - OTNB");
    setAllText("card-validade-cartao", formatDateDisplay(currentData.validadeCartao));

    // Tabela NR10 Card
    for (let r = 0; r < 5; r++) {
        const rowKey = `row${r}`;
        ['bts', 'btc', 'ats', 'atc'].forEach(col => {
            const selector = `.card-nr10-r${r}-${col}, #card-nr10-r${r}-${col}`;
            document.querySelectorAll(selector).forEach(td => {
                const isChecked = currentData.nr10Matrix[rowKey] && currentData.nr10Matrix[rowKey][col];
                if (isChecked) {
                    td.textContent = "X";
                    td.classList.add("marcado");
                } else {
                    td.textContent = "";
                    td.classList.remove("marcado");
                }
            });
        });
    }

    // NR 11/12
    setAllText("card-autorizado-operar", currentData.autorizadoOperar || "---");

    // NR 33
    document.querySelectorAll("#card-nr33-autorizacao, .card-nr33-autorizacao").forEach(el => {
        el.textContent = currentData.nr33Autorizacao;
        el.className = `val-highlight card-nr33-autorizacao ${currentData.nr33Autorizacao === 'SIM' ? 'val-sim' : 'val-nao'}`;
    });

    document.querySelectorAll("#card-nr33-vigia, .card-nr33-vigia").forEach(el => {
        el.textContent = currentData.nr33Vigia;
        el.className = `atrib-val card-nr33-vigia ${currentData.nr33Vigia === 'SIM' ? 'val-sim' : 'val-nao'}`;
    });

    document.querySelectorAll("#card-nr33-supervisor, .card-nr33-supervisor").forEach(el => {
        el.textContent = currentData.nr33Supervisor;
        el.className = `atrib-val card-nr33-supervisor ${currentData.nr33Supervisor === 'SIM' ? 'val-sim' : 'val-nao'}`;
    });

    // NR 35
    document.querySelectorAll("#card-nr35-autorizado, .card-nr35-autorizado").forEach(el => {
        el.textContent = currentData.nr35Autorizado;
        el.className = `val-nr35 card-nr35-autorizado ${currentData.nr35Autorizado === 'SIM' ? 'val-sim' : 'val-nao'}`;
    });

    setAllText("card-nr35-validade", formatDateDisplay(currentData.nr35Validade));

    // Observações
    setAllText("card-observacoes", currentData.observacoes || "");

    // Responsável Técnico no Rodapé (mantém campo de assinatura limpo)
    setAllText("card-resp-tecnico-label", "Assinatura do Responsável Técnico");

    // Ajustar classe de modo de impressão no container wrapper
    const printWrapper = document.getElementById("print-wrapper") || document.body;
    printWrapper.setAttribute("data-print-mode", currentData.modeloImpressao || "pocket");

    // Verificar Alerta de Reciclagem (30 dias antes do vencimento)
    checkReciclagemAlert();
}

// Calcular dias restantes até o vencimento
function getDaysUntilExpiration(dateStr) {
    if (!dateStr) return null;
    let year, month, day;
    if (dateStr.includes("-")) {
        const parts = dateStr.split("-");
        if (parts.length !== 3) return null;
        year = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        day = parseInt(parts[2]);
    } else if (dateStr.includes("/")) {
        const parts = dateStr.split("/");
        if (parts.length !== 3) return null;
        day = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        year = parseInt(parts[2]);
        if (year < 100) year += 2000;
    } else {
        return null;
    }

    if (isNaN(year) || isNaN(month) || isNaN(day)) return null;

    const valDate = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    valDate.setHours(0, 0, 0, 0);

    const diffTime = valDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Verificar vencimento da NR 10 e NR 35 e alertar o Administrador
function checkReciclagemAlert() {
    const alertBox = document.getElementById("reciclagem-alert");
    if (!alertBox) return;

    const daysNR10 = getDaysUntilExpiration(currentData.validadeCartao);
    const daysNR35 = getDaysUntilExpiration(currentData.nr35Validade);

    const isNR10Alert = daysNR10 !== null && daysNR10 <= 30;
    const isNR35Alert = daysNR35 !== null && daysNR35 <= 30;

    if (isNR10Alert || isNR35Alert) {
        const nome = currentData.nome || "Não informado";
        const matricula = currentData.matricula || "---";

        const nomeEl = document.getElementById("alert-colaborador-nome");
        const matrEl = document.getElementById("alert-colaborador-matr");
        const daysBadge = document.getElementById("alert-days-badge");
        const msgEl = document.getElementById("alert-message");

        if (nomeEl) nomeEl.textContent = nome;
        if (matrEl) matrEl.textContent = matricula;

        let nrsVencendo = [];
        let minDays = 99999;

        if (isNR10Alert) {
            nrsVencendo.push("NR 10");
            minDays = Math.min(minDays, daysNR10);
        }
        if (isNR35Alert) {
            nrsVencendo.push("NR 35");
            minDays = Math.min(minDays, daysNR35);
        }

        const normasText = nrsVencendo.join(" e ");

        if (msgEl) {
            msgEl.innerHTML = `Colaborador <strong>${nome}</strong> (Matr.: <strong>${matricula}</strong>) precisa fazer a reciclagem (${normasText}), faça o agendamento.`;
        }

        if (daysBadge) {
            if (minDays < 0) {
                daysBadge.textContent = `VENCIDO HÁ ${Math.abs(minDays)} DIA(S)`;
                daysBadge.style.backgroundColor = "#991b1b";
            } else if (minDays === 0) {
                daysBadge.textContent = "VENCE HOJE";
                daysBadge.style.backgroundColor = "#b91c1c";
            } else {
                daysBadge.textContent = `FALTAM ${minDays} DIA(S)`;
                daysBadge.style.backgroundColor = "#c2410c";
            }
        }

        alertBox.style.display = "flex";
    } else {
        alertBox.style.display = "none";
    }
}

// Exportar Planilha Excel (.xlsx) usando SheetJS ou Gerador de Blob
function exportToXLSX() {
    const headers = [
        ["Data/Hora Registro", "Matrícula", "Nome Completo", "Função", "Unidade / Gerência", "Data Emissão", "Validade Cartão (NR10)", "NR10 Abrangências Marcadas", "NR11/12 Autorizado", "NR33 Aut. Espaço Confinado", "NR33 Vigia", "NR33 Supervisor Entrada", "NR35 Trabalho Altura", "NR35 Validade"]
    ];

    const dataRows = excelHistory.map(item => [
        item.timestamp,
        item.matricula,
        item.nome,
        item.funcao,
        item.unidade || currentData.unidade || "",
        formatDateDisplay(item.dataEmissao || currentData.dataEmissao),
        formatDateDisplay(item.validadeCartao || currentData.validadeCartao),
        item.nr10Summary,
        item.autorizadoOperar || currentData.autorizadoOperar || "",
        item.nr33Autorizacao || currentData.nr33Autorizacao || "NÃO",
        item.nr33Vigia || currentData.nr33Vigia || "NÃO",
        item.nr33Supervisor || currentData.nr33Supervisor || "NÃO",
        item.nr35Autorizado || currentData.nr35Autorizado || "NÃO",
        formatDateDisplay(item.nr35Validade || currentData.nr35Validade)
    ]);

    const fullMatrix = headers.concat(dataRows);

    if (typeof XLSX !== "undefined") {
        const ws = XLSX.utils.aoa_to_sheet(fullMatrix);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Controle Acesso Rede");
        XLSX.writeFile(wb, "controle_acesso_rede.xlsx");
    } else {
        // Fallback export CSV com formato compatível com Excel
        exportToCSV();
    }
}

// Exportar Planilha (.csv) com codificação UTF-8 BOM
function exportToCSV() {
    const headers = [
        "Data/Hora Registro", "Matrícula", "Nome Completo", "Função", "Unidade / Gerência", "Data Emissão", "Validade Cartão (NR10)", "NR10 Abrangências Marcadas", "NR11/12 Autorizado", "NR33 Aut. Espaço Confinado", "NR33 Vigia", "NR33 Supervisor Entrada", "NR35 Trabalho Altura", "NR35 Validade"
    ];

    const rows = excelHistory.map(item => [
        `"${item.timestamp}"`,
        `"${item.matricula}"`,
        `"${item.nome.replace(/"/g, '""')}"`,
        `"${item.funcao.replace(/"/g, '""')}"`,
        `"${(item.unidade || currentData.unidade || '').replace(/"/g, '""')}"`,
        `"${formatDateDisplay(item.dataEmissao || currentData.dataEmissao)}"`,
        `"${formatDateDisplay(item.validadeCartao || currentData.validadeCartao)}"`,
        `"${item.nr10Summary.replace(/"/g, '""')}"`,
        `"${(item.autorizadoOperar || currentData.autorizadoOperar || '').replace(/"/g, '""')}"`,
        `"${item.nr33Autorizacao || currentData.nr33Autorizacao || 'NÃO'}"`,
        `"${item.nr33Vigia || currentData.nr33Vigia || 'NÃO'}"`,
        `"${item.nr33Supervisor || currentData.nr33Supervisor || 'NÃO'}"`,
        `"${item.nr35Autorizado || currentData.nr35Autorizado || 'SIM'}"`,
        `"${formatDateDisplay(item.nr35Validade || currentData.nr35Validade)}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(";")].concat(rows.map(r => r.join(";"))).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "controle_acesso_rede.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Configurar ouvintes de eventos
function setupEventListeners() {
    // Atualizar cartão ao alterar qualquer input do formulário
    const inputs = document.querySelectorAll(".admin-panel input, .admin-panel select, .admin-panel textarea");
    inputs.forEach(input => {
        input.addEventListener("input", () => {
            currentData.statusValidacao = "PENDENTE";
            updateCardPreview();
        });
        input.addEventListener("change", () => {
            currentData.statusValidacao = "PENDENTE";
            updateCardPreview();
        });
    });

    // Auto-preencher nome ao digitar a matrícula
    const inputMatricula = document.getElementById("input-matricula");
    if (inputMatricula) {
        inputMatricula.addEventListener("input", (e) => {
            const matr = e.target.value.trim();
            if (preRegisteredCollaborators[matr]) {
                const inputNome = document.getElementById("input-nome");
                if (inputNome) {
                    inputNome.value = preRegisteredCollaborators[matr];
                    currentData.nome = preRegisteredCollaborators[matr];
                }
            }

            // Também carrega dados existentes do histórico se houver
            const existingRecord = excelHistory.find(item => item.matricula === matr);
            if (existingRecord) {
                currentData.nome = existingRecord.nome;
                currentData.funcao = existingRecord.funcao;
                currentData.unidade = existingRecord.unidade || currentData.unidade;
                currentData.dataEmissao = existingRecord.dataEmissao || currentData.dataEmissao;
                currentData.validadeCartao = existingRecord.validadeCartao || currentData.validadeCartao;
                currentData.autorizadoOperar = existingRecord.autorizadoOperar || currentData.autorizadoOperar;
                currentData.nr33Autorizacao = existingRecord.nr33Autorizacao || currentData.nr33Autorizacao;
                currentData.nr33Vigia = existingRecord.nr33Vigia || currentData.nr33Vigia;
                currentData.nr33Supervisor = existingRecord.nr33Supervisor || currentData.nr33Supervisor;
                currentData.nr35Autorizado = existingRecord.nr35Autorizado || currentData.nr35Autorizado;
                currentData.nr35Validade = existingRecord.nr35Validade || currentData.nr35Validade;
                if (existingRecord.nr10Matrix) {
                    currentData.nr10Matrix = JSON.parse(JSON.stringify(existingRecord.nr10Matrix));
                }
                populateFormFields();
            }
            updateCardPreview();
        });
    }

    // Seleção de Modelo de Impressão
    const selectPrintMode = document.getElementById("select-print-mode");
    if (selectPrintMode) {
        selectPrintMode.addEventListener("change", (e) => {
            currentData.modeloImpressao = e.target.value;
            updateCardPreview();
            saveData();
        });
    }

    // Botão Salvar e Atualizar Planilha
    const btnValidate = document.getElementById("btn-validate");
    if (btnValidate) {
        btnValidate.addEventListener("click", () => {
            currentData.statusValidacao = "VALIDADO";
            const now = new Date();
            const formattedDate = `${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}`;
            currentData.dataValidacao = formattedDate;
            
            updateCardPreview();
            saveData();

            // Adicionar ou atualizar registro ao histórico da planilha
            const newRecord = {
                timestamp: formattedDate,
                matricula: currentData.matricula || "---",
                nome: currentData.nome || "---",
                funcao: currentData.funcao || "---",
                unidade: currentData.unidade || "---",
                dataEmissao: currentData.dataEmissao || "---",
                validadeCartao: currentData.validadeCartao || "---",
                nr10Summary: getNR10Summary(),
                nr10Matrix: JSON.parse(JSON.stringify(currentData.nr10Matrix)),
                autorizadoOperar: currentData.autorizadoOperar || "---",
                nr33Autorizacao: currentData.nr33Autorizacao || "NÃO",
                nr33Vigia: currentData.nr33Vigia || "NÃO",
                nr33Supervisor: currentData.nr33Supervisor || "NÃO",
                nr35Autorizado: currentData.nr35Autorizado || "NÃO",
                nr35Validade: currentData.nr35Validade || "---"
            };

            const existingIndex = excelHistory.findIndex(item => item.matricula === newRecord.matricula);
            if (existingIndex !== -1) {
                excelHistory[existingIndex] = newRecord;
            } else {
                excelHistory.push(newRecord);
            }
            saveExcelHistory();

            alert("💾 Dados salvos e planilha atualizada em doc_acesso_a_rede!");
        });
    }

    // Botões de Exportação da Planilha
    const btnExportXLSX = document.getElementById("btn-export-xlsx");
    if (btnExportXLSX) {
        btnExportXLSX.addEventListener("click", exportToXLSX);
    }

    const btnExportCSV = document.getElementById("btn-export-csv");
    if (btnExportCSV) {
        btnExportCSV.addEventListener("click", exportToCSV);
    }

    // Botão Resetar Dados
    const btnReset = document.getElementById("btn-reset");
    if (btnReset) {
        btnReset.addEventListener("click", () => {
            if (confirm("Deseja restaurar os dados padrão iniciais do cartão?")) {
                currentData = JSON.parse(JSON.stringify(defaultData));
                saveData();
                populateFormFields();
                updateCardPreview();
            }
        });
    }

    // Botão Imprimir Cartão (Admin)
    const btnPrint = document.getElementById("btn-print");
    if (btnPrint) {
        btnPrint.addEventListener("click", () => {
            window.print();
        });
    }

    // Botão Imprimir Cartão (Colaborador)
    const btnColaboradorPrint = document.getElementById("btn-colaborador-print");
    if (btnColaboradorPrint) {
        btnColaboradorPrint.addEventListener("click", () => {
            window.print();
        });
    }

    // Consulta de Matrícula na Área do Colaborador
    const btnSearch = document.getElementById("btn-colaborador-search");
    const inputSearch = document.getElementById("colaborador-search-matricula");

    const performSearch = () => {
        if (!inputSearch) return;
        const matr = inputSearch.value.trim();
        if (!matr) {
            alert("Por favor, digite uma matrícula.");
            return;
        }

        // Buscar no histórico da planilha
        const record = excelHistory.find(item => item.matricula === matr);
        if (record) {
            currentData.nome = record.nome;
            currentData.funcao = record.funcao;
            currentData.matricula = record.matricula;
            currentData.unidade = record.unidade || currentData.unidade;
            currentData.dataEmissao = record.dataEmissao || currentData.dataEmissao;
            currentData.validadeCartao = record.validadeCartao || currentData.validadeCartao;
            currentData.autorizadoOperar = record.autorizadoOperar || currentData.autorizadoOperar;
            currentData.nr33Autorizacao = record.nr33Autorizacao || currentData.nr33Autorizacao;
            currentData.nr33Vigia = record.nr33Vigia || currentData.nr33Vigia;
            currentData.nr33Supervisor = record.nr33Supervisor || currentData.nr33Supervisor;
            currentData.nr35Autorizado = record.nr35Autorizado || currentData.nr35Autorizado;
            currentData.nr35Validade = record.nr35Validade || currentData.nr35Validade;
            
            if (record.nr10Matrix) {
                currentData.nr10Matrix = JSON.parse(JSON.stringify(record.nr10Matrix));
            }
            
            saveData();
            updateCardPreview();
            alert(`✅ Cartão de ${record.nome} carregado com sucesso!`);
        } else {
            alert("❌ Matrícula não encontrada no banco de dados. Solicite o cadastro ao administrador.");
        }
    };

    if (btnSearch) {
        btnSearch.addEventListener("click", performSearch);
    }
    if (inputSearch) {
        inputSearch.addEventListener("keypress", (e) => {
            if (e.key === "Enter") {
                performSearch();
            }
        });
    }

    // Navegação por Abas (Mobile)
    const btnTabForm = document.getElementById("btn-tab-form");
    const btnTabPreview = document.getElementById("btn-tab-preview");
    const tabForm = document.getElementById("tab-form");
    const tabPreview = document.getElementById("tab-preview");

    if (btnTabForm && btnTabPreview) {
        btnTabForm.addEventListener("click", () => {
            btnTabForm.classList.add("active");
            btnTabPreview.classList.remove("active");
            tabForm.classList.add("active");
            tabPreview.classList.remove("active");
        });

        btnTabPreview.addEventListener("click", () => {
            btnTabPreview.classList.add("active");
            btnTabForm.classList.remove("active");
            tabPreview.classList.add("active");
            tabForm.classList.remove("active");
        });
    }
}
