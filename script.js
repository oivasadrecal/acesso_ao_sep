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
    nr33Validade: "2028-05-27",
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

// Colaboradores Pré-registrados no Sistema (limpo para novos cadastros)
const preRegisteredCollaborators = {};

// Matrículas de exemplo antigas que devem ser removidas do cache
const legacyExampleMatriculas = new Set([
    "1008663", "1001234", "1005678", "1009101", "1001213", "1001415", "1001617"
]);

// Limpeza única para apagar o registro antigo de Sávio Galvão Lacerda Filho (4008663) e permitir recadastrá-lo normalmente
(function runOneTimeCleanup() {
    if (localStorage.getItem("sep_cleanup_savio_4008663_done") === "true") return;

    const isSavioOr4008663 = (nome, matr) => {
        const n = String(nome || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase();
        const m = String(matr || "").trim();
        return m === "4008663" || n.includes("SAVIO GALVAO LACERDA") || legacyExampleMatriculas.has(m);
    };

    try {
        const savedAdmin = localStorage.getItem("sep_card_admin_data");
        if (savedAdmin) {
            const parsed = JSON.parse(savedAdmin);
            if (isSavioOr4008663(parsed.nome, parsed.matricula)) {
                parsed.nome = "";
                parsed.matricula = "";
                localStorage.setItem("sep_card_admin_data", JSON.stringify(parsed));
            }
        }

        const savedHistory = localStorage.getItem("sep_excel_history_data");
        if (savedHistory) {
            const parsedHist = JSON.parse(savedHistory);
            if (Array.isArray(parsedHist)) {
                const cleaned = parsedHist.filter(item => !isSavioOr4008663(item.nome, item.matricula));
                localStorage.setItem("sep_excel_history_data", JSON.stringify(cleaned));
            }
        }
    } catch (e) {
        console.error("Erro na limpeza inicial do localStorage", e);
    }

    localStorage.setItem("sep_cleanup_savio_4008663_done", "true");
})();

function createDefaultRecord(matricula, nome) {
    return {
        timestamp: new Date().toLocaleDateString('pt-BR') + " " + new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'}),
        matricula: matricula,
        nome: nome,
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
        nr33Validade: "2028-05-27",
        nr35Autorizado: "SIM",
        nr35Validade: "2028-05-27"
    };
}

// Estado Atual da Aplicação
let currentData = loadSavedData();
let excelHistory = loadSavedExcelHistory();

// Carregar dados salvos ou usar padrão
function loadSavedData() {
    const saved = localStorage.getItem("sep_card_admin_data");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            if (legacyExampleMatriculas.has(String(parsed.matricula).trim())) {
                parsed.nome = "";
                parsed.matricula = "";
            }
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
    let records = [];
    const saved = localStorage.getItem("sep_excel_history_data");
    if (saved) {
        try {
            let parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
                records = parsed.filter(item =>
                    !legacyExampleMatriculas.has(String(item.matricula || "").trim()) &&
                    item.matricula &&
                    item.matricula !== "---"
                );
                if (records.length !== parsed.length) {
                    localStorage.setItem("sep_excel_history_data", JSON.stringify(records));
                }
            }
        } catch (e) {
            console.error("Erro ao ler histórico da planilha", e);
        }
    }

    // Garantir que colaboradores pré-registrados no código (se houver) estejam no banco de dados
    let updated = false;
    Object.entries(preRegisteredCollaborators).forEach(([matr, nome]) => {
        if (!records.some(item => String(item.matricula).trim() === matr)) {
            records.push(createDefaultRecord(matr, nome));
            updated = true;
        }
    });

    if (updated || !saved) {
        localStorage.setItem("sep_excel_history_data", JSON.stringify(records));
    }

    return records;
}

function saveExcelHistory() {
    localStorage.setItem("sep_excel_history_data", JSON.stringify(excelHistory));
    renderExcelHistoryTable();
    renderExpirationAlerts();
    renderMatriculaDatalist();
}

// Criar/atualizar datalist com matrículas cadastradas para facilitar a busca
function renderMatriculaDatalist() {
    let datalist = document.getElementById("matriculas-datalist");
    if (!datalist) {
        datalist = document.createElement("datalist");
        datalist.id = "matriculas-datalist";
        document.body.appendChild(datalist);
    }
    datalist.innerHTML = "";

    const seen = new Set();
    excelHistory.forEach(item => {
        const m = String(item.matricula || "").trim();
        if (m && m !== "---" && !seen.has(m)) {
            seen.add(m);
            const opt = document.createElement("option");
            opt.value = m;
            opt.label = item.nome ? `${m} - ${item.nome}` : m;
            datalist.appendChild(opt);
        }
    });

    const inputColab = document.getElementById("colaborador-search-matricula");
    if (inputColab) inputColab.setAttribute("list", "matriculas-datalist");

    const inputAdmin = document.getElementById("input-matricula");
    if (inputAdmin) inputAdmin.setAttribute("list", "matriculas-datalist");
}

// Renderizar Tabela de Histórico da Planilha na Página Admin
function renderExcelHistoryTable() {
    const tbody = document.getElementById("excel-history-body");
    if (!tbody) return;

    tbody.innerHTML = "";

    if (excelHistory.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="8" style="text-align: center; color: #64748b; padding: 14px;">Nenhum colaborador cadastrado ainda. Preencha o formulário acima ou importe uma planilha.</td>`;
        tbody.appendChild(tr);
        return;
    }

    excelHistory.slice().reverse().forEach(record => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><strong>${record.timestamp || "---"}</strong></td>
            <td>${record.matricula}</td>
            <td>${record.nome}</td>
            <td>${record.funcao}</td>
            <td>${formatDateDisplay(record.validadeCartao)}</td>
            <td>${formatDateDisplay(record.nr33Validade)}</td>
            <td>${formatDateDisplay(record.nr35Validade)}</td>
            <td style="white-space: nowrap;">
                <button type="button" class="btn-row-load" data-matr="${record.matricula}" title="Carregar no formulário" style="border: none; background: #e0f2fe; color: #0369a1; padding: 3px 7px; border-radius: 4px; cursor: pointer; margin-right: 4px;">✏️</button>
                <button type="button" class="btn-row-delete" data-matr="${record.matricula}" title="Excluir cadastro" style="border: none; background: #fee2e2; color: #b91c1c; padding: 3px 7px; border-radius: 4px; cursor: pointer;">🗑️</button>
            </td>
        `;
        tbody.appendChild(tr);
    });

    tbody.querySelectorAll(".btn-row-load").forEach(btn => {
        btn.addEventListener("click", () => {
            const matr = btn.getAttribute("data-matr");
            const rec = excelHistory.find(item => String(item.matricula) === String(matr));
            if (rec) {
                Object.assign(currentData, rec);
                if (rec.nr10Matrix) {
                    currentData.nr10Matrix = JSON.parse(JSON.stringify(rec.nr10Matrix));
                }
                populateFormFields();
                updateCardPreview();
                saveData();
            }
        });
    });

    tbody.querySelectorAll(".btn-row-delete").forEach(btn => {
        btn.addEventListener("click", () => {
            const matr = btn.getAttribute("data-matr");
            if (confirm(`Deseja remover a matrícula ${matr} do banco de dados?`)) {
                excelHistory = excelHistory.filter(item => String(item.matricula) !== String(matr));
                saveExcelHistory();
            }
        });
    });
}

// Converter DD/MM/AAAA para AAAA-MM-DD
function normalizeDateInput(dateStr) {
    if (!dateStr) return "";
    const s = String(dateStr).trim();
    if (s.includes("/")) {
        const parts = s.split("/");
        if (parts.length === 3) {
            let [d, m, y] = parts;
            if (y.length === 2) y = "20" + y;
            return `${y.padStart(4, "0")}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
        }
    }
    return s;
}

// Reconstruir matriz NR10 a partir do resumo da planilha (ex: "L2 [BTS,BTC,ATS,ATC]")
function parseNR10SummaryToMatrix(summaryStr) {
    const matrix = JSON.parse(JSON.stringify(defaultData.nr10Matrix));
    if (!summaryStr || typeof summaryStr !== "string") return matrix;
    if (!summaryStr.includes("L")) return matrix;

    for (let r = 0; r < 5; r++) {
        matrix[`row${r}`] = { bts: false, btc: false, ats: false, atc: false };
    }

    const regex = /L([0-4])\s*\[([^\]]+)\]/gi;
    let match;
    while ((match = regex.exec(summaryStr)) !== null) {
        const rowIdx = match[1];
        const cols = match[2].toUpperCase().split(",").map(c => c.trim());
        const rowObj = matrix[`row${rowIdx}`];
        if (rowObj) {
            cols.forEach(c => {
                if (c === "BTS") rowObj.bts = true;
                if (c === "BTC") rowObj.btc = true;
                if (c === "ATS") rowObj.ats = true;
                if (c === "ATC") rowObj.atc = true;
            });
        }
    }
    return matrix;
}

// Converter linhas de uma planilha (matriz 2D) em registros do sistema
function parseRowsToRecords(rows) {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    // Identificar se a primeira linha é cabeçalho
    const firstRow = rows[0].map(c => String(c || "").trim().toLowerCase());
    const hasHeader = firstRow.some(h =>
        h.includes("matr") || h.includes("nome") || h.includes("fun") || h.includes("data")
    );

    let colMap = {
        timestamp: 0,
        matricula: 1,
        nome: 2,
        funcao: 3,
        unidade: 4,
        dataEmissao: 5,
        validadeCartao: 6,
        nr10Summary: 7,
        autorizadoOperar: 8,
        nr33Autorizacao: 9,
        nr33Vigia: 10,
        nr33Supervisor: 11,
        nr33Validade: 12,
        nr35Autorizado: 13,
        nr35Validade: 14
    };

    if (hasHeader) {
        // Caso seja uma planilha simples de 2 ou 3 colunas (ex: Matrícula | Nome | Função)
        const matrIdx = firstRow.findIndex(h => h.includes("matr") || h.includes("id") || h.includes("registro"));
        const nomeIdx = firstRow.findIndex(h => h.includes("nome") || h.includes("colaborador"));
        const funcIdx = firstRow.findIndex(h => h.includes("fun") || h.includes("cargo"));
        const unidIdx = firstRow.findIndex(h => h.includes("unid") || h.includes("ger"));
        const emisIdx = firstRow.findIndex(h => h.includes("emiss"));
        const val10Idx = firstRow.findIndex(h => h.includes("validade cart") || h.includes("nr10 val") || h === "validade");
        const nr10Idx = firstRow.findIndex(h => h.includes("abrang") || h.includes("nr10"));
        const nr11Idx = firstRow.findIndex(h => h.includes("11") || h.includes("12") || h.includes("operar"));
        const nr33AutIdx = firstRow.findIndex(h => h.includes("33") && (h.includes("aut") || h.includes("espa")));
        const nr33VigIdx = firstRow.findIndex(h => h.includes("vigia"));
        const nr33SupIdx = firstRow.findIndex(h => h.includes("superv"));
        const nr33ValIdx = firstRow.findIndex(h => h.includes("33") && h.includes("val"));
        const nr35AutIdx = firstRow.findIndex(h => h.includes("35") && (h.includes("altura") || h.includes("aut")));
        const nr35ValIdx = firstRow.findIndex(h => h.includes("35") && h.includes("val"));

        if (matrIdx !== -1 && nomeIdx !== -1) {
            colMap = {
                timestamp: firstRow.findIndex(h => h.includes("data/hora") || h.includes("carimbo")),
                matricula: matrIdx,
                nome: nomeIdx,
                funcao: funcIdx,
                unidade: unidIdx,
                dataEmissao: emisIdx,
                validadeCartao: val10Idx,
                nr10Summary: nr10Idx,
                autorizadoOperar: nr11Idx,
                nr33Autorizacao: nr33AutIdx,
                nr33Vigia: nr33VigIdx,
                nr33Supervisor: nr33SupIdx,
                nr33Validade: nr33ValIdx,
                nr35Autorizado: nr35AutIdx,
                nr35Validade: nr35ValIdx
            };
        } else if (rows[0].length >= 2 && rows[0].length <= 4) {
            colMap.matricula = 0;
            colMap.nome = 1;
            colMap.funcao = 2;
        }
    } else if (rows[0].length >= 2 && rows[0].length <= 4) {
        colMap.matricula = 0;
        colMap.nome = 1;
        colMap.funcao = 2;
    }

    const dataRows = hasHeader ? rows.slice(1) : rows;
    const records = [];

    dataRows.forEach(row => {
        if (!Array.isArray(row)) return;
        const getCol = (idx) => (idx !== undefined && idx >= 0 && idx < row.length) ? String(row[idx] ?? "").trim() : "";

        const matr = getCol(colMap.matricula);
        const nome = getCol(colMap.nome);
        if (!matr || matr === "---" || legacyExampleMatriculas.has(matr)) return;

        const base = createDefaultRecord(matr, nome || "---");
        const nr10Sum = getCol(colMap.nr10Summary) || base.nr10Summary;

        records.push({
            timestamp: getCol(colMap.timestamp) || base.timestamp,
            matricula: matr,
            nome: nome || "---",
            funcao: getCol(colMap.funcao) || base.funcao,
            unidade: getCol(colMap.unidade) || base.unidade,
            dataEmissao: normalizeDateInput(getCol(colMap.dataEmissao)) || base.dataEmissao,
            validadeCartao: normalizeDateInput(getCol(colMap.validadeCartao)) || base.validadeCartao,
            nr10Summary: nr10Sum,
            nr10Matrix: parseNR10SummaryToMatrix(nr10Sum),
            autorizadoOperar: getCol(colMap.autorizadoOperar) || base.autorizadoOperar,
            nr33Autorizacao: (getCol(colMap.nr33Autorizacao) || base.nr33Autorizacao).toUpperCase(),
            nr33Vigia: (getCol(colMap.nr33Vigia) || base.nr33Vigia).toUpperCase(),
            nr33Supervisor: (getCol(colMap.nr33Supervisor) || base.nr33Supervisor).toUpperCase(),
            nr33Validade: normalizeDateInput(getCol(colMap.nr33Validade)) || base.nr33Validade,
            nr35Autorizado: (getCol(colMap.nr35Autorizado) || base.nr35Autorizado).toUpperCase(),
            nr35Validade: normalizeDateInput(getCol(colMap.nr35Validade)) || base.nr35Validade
        });
    });

    return records;
}

// Fazer parse de texto CSV (suporta separador ';' ou ',')
function parseCSVText(csvText) {
    const cleanText = csvText.replace(/^\uFEFF/, "").trim();
    if (!cleanText) return [];

    const lines = cleanText.split(/\r?\n/).filter(l => l.trim().length > 0);
    if (lines.length === 0) return [];

    const firstLine = lines[0];
    const delimiter = (firstLine.split(";").length > firstLine.split(",").length) ? ";" : ",";

    const rows = lines.map(line => {
        const result = [];
        let cur = "";
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    cur += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (ch === delimiter && !inQuotes) {
                result.push(cur.trim());
                cur = "";
            } else {
                cur += ch;
            }
        }
        result.push(cur.trim());
        return result;
    });

    return parseRowsToRecords(rows);
}

// Mesclar registros importados no histórico atual
function mergeImportedRecords(newRecords) {
    if (!Array.isArray(newRecords) || newRecords.length === 0) return 0;
    let count = 0;
    newRecords.forEach(rec => {
        const idx = excelHistory.findIndex(item => String(item.matricula).trim() === String(rec.matricula).trim());
        if (idx !== -1) {
            excelHistory[idx] = rec;
        } else {
            excelHistory.push(rec);
        }
        count++;
    });
    saveExcelHistory();
    return count;
}

// Converter qualquer link do Google Sheets para link de exportação CSV direto
function convertGoogleSheetsUrlToCsv(url) {
    const trimmed = String(url || "").trim();
    if (!trimmed) return "";

    // Se já for um link "Publicado na Web" com output=csv
    if (trimmed.includes("output=csv") || trimmed.endsWith(".csv")) {
        return trimmed;
    }

    // Se for link publicado na web com /pubhtml, trocar para /pub?output=csv
    if (trimmed.includes("/pubhtml")) {
        return trimmed.replace("/pubhtml", "/pub?output=csv");
    }
    if (trimmed.includes("/pub")) {
        return trimmed + (trimmed.includes("?") ? "&output=csv" : "?output=csv");
    }

    // Extrair ID da planilha padrão: https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit#gid=0
    const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (match && match[1]) {
        const sheetId = match[1];
        const gidMatch = trimmed.match(/[#&?]gid=([0-9]+)/);
        const gidParam = gidMatch ? `&gid=${gidMatch[1]}` : "";
        return `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv${gidParam}`;
    }

    return trimmed;
}

// Baixar e sincronizar dados de uma planilha do Google Sheets
async function syncFromGoogleSheets(rawUrl, silent = false) {
    const csvUrl = convertGoogleSheetsUrlToCsv(rawUrl);
    if (!csvUrl) {
        if (!silent) alert("Por favor, cole um link válido do Google Sheets.");
        return 0;
    }

    try {
        localStorage.setItem("sep_gsheets_url", rawUrl.trim());
        const response = await fetch(csvUrl, { cache: "no-store" });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        const csvText = await response.text();
        const records = parseCSVText(csvText);
        const count = mergeImportedRecords(records);
        if (!silent) {
            if (count > 0) {
                alert(`✅ Sincronizado com sucesso! ${count} colaborador(es) carregado(s) do Google Sheets.`);
            } else {
                alert("⚠️ A planilha foi acessada, mas nenhuma linha com Matrícula e Nome foi encontrada.");
            }
        }
        return count;
    } catch (err) {
        console.warn("Aviso ao sincronizar Google Sheets:", err);
        if (!silent) {
            alert("❌ Não foi possível baixar a planilha do Google Sheets.\n\nVerifique se no Google Sheets você foi em:\n1. 'Arquivo > Compartilhar > Publicar na web' (formato CSV), OU\n2. 'Compartilhar > Qualquer pessoa com o link pode ver'.");
        }
        return 0;
    }
}

// Carregar automaticamente CSV do repositório (GitHub Pages) e Google Sheets salvo
async function loadExternalSpreadsheetsOnInit() {
    const gsheetsInput = document.getElementById("input-gsheets-url");
    const savedGSheetsUrl = localStorage.getItem("sep_gsheets_url") || "";
    if (gsheetsInput && savedGSheetsUrl) {
        gsheetsInput.value = savedGSheetsUrl;
    }

    // 1. Tentar carregar doc_acesso_a_rede/controle_acesso_rede.csv do próprio site (GitHub Pages / Servidor Local)
    try {
        const res = await fetch("doc_acesso_a_rede/controle_acesso_rede.csv", { cache: "no-store" });
        if (res.ok) {
            const text = await res.text();
            const records = parseCSVText(text);
            if (records.length > 0) {
                mergeImportedRecords(records);
            }
        }
    } catch (e) {
        // Ignorado quando aberto via file:// local sem servidor HTTP
    }

    // 2. Se houver URL do Google Sheets configurada, sincronizar silenciosamente
    if (savedGSheetsUrl) {
        await syncFromGoogleSheets(savedGSheetsUrl, true);
    }
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
        const daysNR33 = getDaysUntilExpiration(record.nr33Validade);
        const daysNR35 = getDaysUntilExpiration(record.nr35Validade);
        
        const isNR10Alert = daysNR10 !== null && daysNR10 <= 30;
        const isNR33Alert = daysNR33 !== null && daysNR33 <= 30;
        const isNR35Alert = daysNR35 !== null && daysNR35 <= 30;
        
        return isNR10Alert || isNR33Alert || isNR35Alert;
    });

    if (expiringRecords.length === 0) {
        listContainer.innerHTML = `<div class="empty-alerts">✅ Nenhuma credencial a vencer ou vencida.</div>`;
        return;
    }

    expiringRecords.forEach(record => {
        const daysNR10 = getDaysUntilExpiration(record.validadeCartao);
        const daysNR33 = getDaysUntilExpiration(record.nr33Validade);
        const daysNR35 = getDaysUntilExpiration(record.nr35Validade);

        let nr10Text = "";
        let nr33Text = "";
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

        if (daysNR33 !== null && daysNR33 <= 30) {
            if (daysNR33 < 0) {
                nr33Text = `<span class="alert-tag expired">NR33 Vencida há ${Math.abs(daysNR33)} dias</span>`;
            } else if (daysNR33 === 0) {
                nr33Text = `<span class="alert-tag warning">NR33 Vence Hoje</span>`;
            } else {
                nr33Text = `<span class="alert-tag warning">NR33 Vence em ${daysNR33} dias</span>`;
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
                ${nr33Text}
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
    } else {
        const printSelect = document.getElementById("select-print-mode");
        if (printSelect && currentData.modeloImpressao) {
            printSelect.value = currentData.modeloImpressao;
        }
    }
    updateCardPreview();
    renderExcelHistoryTable();
    renderExpirationAlerts();
    renderMatriculaDatalist();
    setupEventListeners();
    loadExternalSpreadsheetsOnInit();
});

// Preencher formulário admin com os dados do estado
function populateFormFields() {
    const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (!el) return;
        if (el.tagName === "SELECT" && val) {
            const exists = Array.from(el.options).some(opt => opt.value === val);
            if (!exists) {
                const newOpt = document.createElement("option");
                newOpt.value = val;
                newOpt.textContent = val;
                el.appendChild(newOpt);
            }
        }
        el.value = val || "";
    };

    setVal("input-nome", currentData.nome);
    setVal("input-funcao", currentData.funcao);
    setVal("input-matricula", currentData.matricula);
    setVal("input-data-emissao", currentData.dataEmissao);
    setVal("input-unidade", currentData.unidade);
    const normalizeOp = (v) => {
        const up = String(v || "CESTO AÉREO").trim().toUpperCase();
        if (up === "CESTO AÉREO MOTOPODA") return "CESTO AÉREO / MOTOPODA";
        if (up === "CESTO AÉREO MOTOPODA MOTOSERRA") return "CESTO AÉREO / MOTOPODA / MOTOSERRA";
        return up;
    };
    currentData.autorizadoOperar = normalizeOp(currentData.autorizadoOperar);
    setVal("input-validade-cartao", currentData.validadeCartao);
    setVal("input-autorizado-operar", currentData.autorizadoOperar);
    setVal("input-nr33-autorizacao", currentData.nr33Autorizacao || "NÃO");
    setVal("input-nr33-vigia", currentData.nr33Vigia || "NÃO");
    setVal("input-nr33-supervisor", currentData.nr33Supervisor || "NÃO");
    setVal("input-nr33-validade", currentData.nr33Validade);
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
        currentData.nr33Validade = getElVal("input-nr33-validade");
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
    setAllText("card-autorizado-operar", (currentData.autorizadoOperar || "---").toUpperCase());

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

    setAllText("card-nr33-validade", formatDateDisplay(currentData.nr33Validade));

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
    const printMode = currentData.modeloImpressao || "pocket";
    printWrapper.setAttribute("data-print-mode", printMode);

    // Atualizar rótulos de dimensão conforme o modelo selecionado (10x6cm ou 7x5cm)
    const is7x5 = printMode === "pocket-7x5";
    document.querySelectorAll(".fold-label").forEach(el => {
        el.textContent = is7x5
            ? "✂️ DOBRE AQUI (LINHA CENTRAL DO CARTÃO 7x5cm) ✂️"
            : "✂️ DOBRE AQUI (LINHA CENTRAL DO CARTÃO 10x6cm) ✂️";
    });
    const previewTitleSpan = document.querySelector(".preview-title span:first-child");
    if (previewTitleSpan) {
        previewTitleSpan.textContent = is7x5
            ? "Pré-visualização do Cartão Modelo Dobrável (7 cm x 5 cm)"
            : "Pré-visualização do Cartão Modelo Dobrável (10 cm x 6 cm)";
    }
    const btnPrintAdmin = document.getElementById("btn-print");
    if (btnPrintAdmin) {
        btnPrintAdmin.innerHTML = is7x5
            ? "<span>🖨️</span> Imprimir Cartão (7x5 cm)"
            : "<span>🖨️</span> Imprimir Cartão (10x6 cm)";
    }

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
    const daysNR33 = getDaysUntilExpiration(currentData.nr33Validade);
    const daysNR35 = getDaysUntilExpiration(currentData.nr35Validade);

    const isNR10Alert = daysNR10 !== null && daysNR10 <= 30;
    const isNR33Alert = daysNR33 !== null && daysNR33 <= 30;
    const isNR35Alert = daysNR35 !== null && daysNR35 <= 30;

    if (isNR10Alert || isNR33Alert || isNR35Alert) {
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
        if (isNR33Alert) {
            nrsVencendo.push("NR 33");
            minDays = Math.min(minDays, daysNR33);
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
        ["Data/Hora Registro", "Matrícula", "Nome Completo", "Função", "Unidade / Gerência", "Data Emissão", "Validade Cartão (NR10)", "NR10 Abrangências Marcadas", "NR11/12 Autorizado", "NR33 Aut. Espaço Confinado", "NR33 Vigia", "NR33 Supervisor Entrada", "NR33 Validade", "NR35 Trabalho Altura", "NR35 Validade"]
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
        formatDateDisplay(item.nr33Validade || currentData.nr33Validade),
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
        "Data/Hora Registro", "Matrícula", "Nome Completo", "Função", "Unidade / Gerência", "Data Emissão", "Validade Cartão (NR10)", "NR10 Abrangências Marcadas", "NR11/12 Autorizado", "NR33 Aut. Espaço Confinado", "NR33 Vigia", "NR33 Supervisor Entrada", "NR33 Validade", "NR35 Trabalho Altura", "NR35 Validade"
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
        `"${formatDateDisplay(item.nr33Validade || currentData.nr33Validade)}"`,
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
    const syncCurrentToRegisteredCollaborator = () => {
        const matr = String(currentData.matricula || "").trim();
        if (!matr || matr === "---") return;
        const idx = excelHistory.findIndex(item => String(item.matricula || "").trim() === matr);
        if (idx !== -1) {
            excelHistory[idx] = {
                ...excelHistory[idx],
                nome: currentData.nome || excelHistory[idx].nome,
                funcao: currentData.funcao || excelHistory[idx].funcao,
                unidade: currentData.unidade || excelHistory[idx].unidade,
                dataEmissao: currentData.dataEmissao || excelHistory[idx].dataEmissao,
                validadeCartao: currentData.validadeCartao || excelHistory[idx].validadeCartao,
                nr10Summary: getNR10Summary(),
                nr10Matrix: JSON.parse(JSON.stringify(currentData.nr10Matrix)),
                autorizadoOperar: currentData.autorizadoOperar || "CESTO AÉREO",
                nr33Autorizacao: currentData.nr33Autorizacao || "NÃO",
                nr33Vigia: currentData.nr33Vigia || "NÃO",
                nr33Supervisor: currentData.nr33Supervisor || "NÃO",
                nr33Validade: currentData.nr33Validade || "---",
                nr35Autorizado: currentData.nr35Autorizado || "NÃO",
                nr35Validade: currentData.nr35Validade || "---",
                observacoes: currentData.observacoes || "",
                responsavelTecnico: currentData.responsavelTecnico || ""
            };
            saveExcelHistory();
        }
    };

    const inputs = document.querySelectorAll(".admin-panel input, .admin-panel select, .admin-panel textarea");
    inputs.forEach(input => {
        input.addEventListener("input", () => {
            currentData.statusValidacao = "PENDENTE";
            updateCardPreview();
            saveData();
            if (input.id !== "input-matricula") {
                syncCurrentToRegisteredCollaborator();
            }
        });
        input.addEventListener("change", () => {
            currentData.statusValidacao = "PENDENTE";
            updateCardPreview();
            saveData();
            if (input.id !== "input-matricula") {
                syncCurrentToRegisteredCollaborator();
            }
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
                currentData.nr33Validade = existingRecord.nr33Validade || currentData.nr33Validade;
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
                nr33Validade: currentData.nr33Validade || "---",
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

    // Botão Importar Planilha (.xlsx ou .csv)
    const btnImportFile = document.getElementById("btn-import-file");
    const inputImportFile = document.getElementById("input-import-file");
    if (btnImportFile && inputImportFile) {
        btnImportFile.addEventListener("click", () => {
            inputImportFile.click();
        });

        inputImportFile.addEventListener("change", (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            const fileName = file.name.toLowerCase();
            if (fileName.endsWith(".csv")) {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    const records = parseCSVText(String(evt.target.result || ""));
                    const count = mergeImportedRecords(records);
                    alert(`✅ ${count} colaborador(es) importado(s) do arquivo CSV com sucesso!`);
                };
                reader.readAsText(file, "UTF-8");
            } else if (typeof XLSX !== "undefined") {
                const reader = new FileReader();
                reader.onload = (evt) => {
                    try {
                        const data = new Uint8Array(evt.target.result);
                        const workbook = XLSX.read(data, { type: "array" });
                        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                        const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false });
                        const records = parseRowsToRecords(rows);
                        const count = mergeImportedRecords(records);
                        alert(`✅ ${count} colaborador(es) importado(s) da planilha Excel com sucesso!`);
                    } catch (err) {
                        console.error("Erro ao ler planilha Excel:", err);
                        alert("❌ Erro ao ler o arquivo Excel. Verifique o formato ou tente importar como .csv.");
                    }
                };
                reader.readAsArrayBuffer(file);
            } else {
                alert("Por favor, selecione um arquivo .csv.");
            }
            inputImportFile.value = "";
        });
    }

    // Botão Sincronizar Google Sheets
    const btnSyncGSheets = document.getElementById("btn-sync-gsheets");
    const inputGSheetsUrl = document.getElementById("input-gsheets-url");
    if (btnSyncGSheets && inputGSheetsUrl) {
        btnSyncGSheets.addEventListener("click", () => {
            syncFromGoogleSheets(inputGSheetsUrl.value, false);
        });
    }

    // Botão Limpar Todo o Banco de Dados
    const btnClearHistory = document.getElementById("btn-clear-history");
    if (btnClearHistory) {
        btnClearHistory.addEventListener("click", () => {
            if (confirm("Deseja realmente apagar todos os colaboradores cadastrados no banco de dados?")) {
                excelHistory = [];
                saveExcelHistory();
                currentData.nome = "";
                currentData.matricula = "";
                saveData();
                populateFormFields();
                updateCardPreview();
            }
        });
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

    const performSearch = async () => {
        if (!inputSearch) return;
        const matr = inputSearch.value.trim();
        if (!matr) {
            alert("Por favor, digite uma matrícula.");
            return;
        }

        // Recarregar histórico atualizado do localStorage e sincronizar planilha externa se houver
        excelHistory = loadSavedExcelHistory();
        await loadExternalSpreadsheetsOnInit();
        const savedAdminData = loadSavedData();

        // Buscar no histórico da planilha (por matrícula exata ou por nome)
        let record = excelHistory.find(item =>
            String(item.matricula || "").trim() === matr ||
            String(item.nome || "").trim().toLowerCase() === matr.toLowerCase()
        );

        // Fallback: verificar se corresponde aos colaboradores pré-registrados
        if (!record && preRegisteredCollaborators[matr]) {
            record = createDefaultRecord(matr, preRegisteredCollaborators[matr]);
            excelHistory.push(record);
            saveExcelHistory();
        }

        // Fallback: verificar se corresponde ao cadastro atual em edição no painel Admin
        if (!record && savedAdminData && String(savedAdminData.matricula || "").trim() === matr && savedAdminData.nome) {
            record = savedAdminData;
        }

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
            currentData.nr33Validade = record.nr33Validade || currentData.nr33Validade;
            currentData.nr35Autorizado = record.nr35Autorizado || currentData.nr35Autorizado;
            currentData.nr35Validade = record.nr35Validade || currentData.nr35Validade;
            
            if (record.nr10Matrix) {
                currentData.nr10Matrix = JSON.parse(JSON.stringify(record.nr10Matrix));
            }
            
            saveData();
            updateCardPreview();
            alert(`✅ Cartão de ${record.nome} (Matr.: ${record.matricula}) carregado com sucesso!`);
        } else {
            const lista = excelHistory
                .map(r => `${r.matricula} (${r.nome})`)
                .filter(Boolean);
            const msgExtra = lista.length > 0
                ? `\n\nMatrículas atualmente cadastradas:\n• ${lista.join("\n• ")}`
                : `\n\nNenhum colaborador foi cadastrado ainda. Acesse a Área do Administrador para cadastrar ou importar sua planilha.`;
            alert(`❌ Matrícula "${matr}" não encontrada no banco de dados.${msgExtra}`);
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
