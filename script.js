class ContactFormatter {
    constructor() {
        this.originalData = null;
        this.processedData = null;
        this.stats = {
            identifiedContacts: 0,
            totalContacts: 0,
            removedContacts: 0
        };
        this.removedNumbers = [];
        this.removedNames = [];
        this.usedDefaultNames = 0;
        this.whatsappResults = [];

        this.loadApiSettings();
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const removeFileBtn = document.getElementById('removeFile');
        const downloadBtn = document.getElementById('downloadBtn');
        const downloadFinalBtn = document.getElementById('downloadFinalBtn');
        const newFileBtn = document.getElementById('newFileBtn');
        const toggleDebugBtn = document.getElementById('toggleDebug');
        const validateWhatsappBtn = document.getElementById('validateWhatsappBtn');
        const testApiBtn = document.getElementById('testApiBtn');
        const startValidationBtn = document.getElementById('startValidationBtn');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('drop', this.handleDrop.bind(this));
        uploadArea.addEventListener('dragleave', this.handleDragLeave.bind(this));

        fileInput.addEventListener('change', this.handleFileSelect.bind(this));
        removeFileBtn.addEventListener('click', this.resetInterface.bind(this));
        downloadBtn.addEventListener('click', this.downloadProcessedFile.bind(this));
        downloadFinalBtn.addEventListener('click', this.downloadFinalCSV.bind(this));
        newFileBtn.addEventListener('click', this.resetInterface.bind(this));
        toggleDebugBtn.addEventListener('click', this.toggleDebugInfo.bind(this));
        validateWhatsappBtn.addEventListener('click', this.showWhatsAppConfig.bind(this));
        testApiBtn.addEventListener('click', this.testApiConnection.bind(this));
        startValidationBtn.addEventListener('click', this.validateWhatsApp.bind(this));

        // Adicionar listeners para inputs da API para mostrar botão de teste
        const apiInputs = ['serverUrl', 'instanceId', 'apiKey'];
        apiInputs.forEach(inputId => {
            document.getElementById(inputId).addEventListener('input', this.checkApiInputs.bind(this));
            document.getElementById(inputId).addEventListener('input', this.saveApiSettings.bind(this));
        });
    }

    loadApiSettings() {
        const savedSettings = {
            serverUrl: localStorage.getItem('whatsapp_server_url') || '',
            instanceId: localStorage.getItem('whatsapp_instance_id') || '',
            apiKey: localStorage.getItem('whatsapp_api_key') || ''
        };

        if (savedSettings.serverUrl) {
            setTimeout(() => {
                document.getElementById('serverUrl').value = savedSettings.serverUrl;
            }, 100);
        }
        if (savedSettings.instanceId) {
            setTimeout(() => {
                document.getElementById('instanceId').value = savedSettings.instanceId;
            }, 100);
        }
        if (savedSettings.apiKey) {
            setTimeout(() => {
                document.getElementById('apiKey').value = savedSettings.apiKey;
            }, 100);
        }

        // Verificar se deve mostrar botões após carregar dados
        setTimeout(() => {
            this.checkApiInputs();
            
            // Se há dados salvos, mostrar seção de validação WhatsApp
            if (savedSettings.serverUrl || savedSettings.instanceId || savedSettings.apiKey) {
                document.getElementById('whatsappInfo').style.display = 'block';
            }
        }, 200);
    }

    saveApiSettings() {
        const serverUrl = document.getElementById('serverUrl').value;
        const instanceId = document.getElementById('instanceId').value;
        const apiKey = document.getElementById('apiKey').value;

        if (serverUrl) localStorage.setItem('whatsapp_server_url', serverUrl);
        if (instanceId) localStorage.setItem('whatsapp_instance_id', instanceId);
        if (apiKey) localStorage.setItem('whatsapp_api_key', apiKey);
    }

    handleDragOver(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        document.getElementById('uploadArea').classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        if (!file.name.toLowerCase().endsWith('.csv')) {
            alert('Por favor, selecione um arquivo CSV válido.');
            return;
        }

        this.showFileInfo(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.originalData = e.target.result;
                this.startProcessing();
            } catch (error) {
                console.error('Erro ao processar arquivo:', error);
                alert('Erro ao processar o arquivo. Verifique se é um CSV válido do Google Contacts.');
            }
        };
        reader.readAsText(file, 'utf-8');
    }

    showFileInfo(file) {
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = this.formatFileSize(file.size);
        document.getElementById('fileInfo').style.display = 'flex';
        document.getElementById('uploadArea').style.display = 'none';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    startProcessing() {
        document.getElementById('processingSection').style.display = 'block';

        setTimeout(() => {
            this.processContactData();
        }, 500);
    }

    processContactData() {
        const lines = this.originalData.split('\n');
        const header = lines[0];
        const dataLines = lines.slice(1).filter(line => line.trim());

        this.updateProgress(25, 'Analisando estrutura dos dados...');

        const processedLines = [header];
        this.stats = { identifiedContacts: 0, totalContacts: 0, removedContacts: 0 };
        this.removedNumbers = [];
        this.removedNames = [];
        this.usedDefaultNames = 0;

        // Map para garantir números únicos - chave: número, valor: dados do contato
        this.uniqueContacts = new Map();

        this.stats.identifiedContacts = dataLines.length;

        dataLines.forEach((line, index) => {
            const progress = 25 + (index / dataLines.length) * 50;
            this.updateProgress(progress, `Processando contato ${index + 1} de ${dataLines.length}...`);

            // Processar contato com deduplicação
            this.processContactLineUnique(line);
        });

        // Converter Map para array de linhas CSV
        this.uniqueContacts.forEach(contactData => {
            processedLines.push(contactData.csvLine);
            this.stats.totalContacts++;
        });

        // Calcular contatos removidos (duplicados + inválidos)
        this.stats.removedContacts = this.stats.identifiedContacts - this.stats.totalContacts;

        this.updateProgress(90, 'Finalizando processamento...');

        this.processedData = processedLines.join('\n');

        console.log(`Processamento concluído: ${this.stats.identifiedContacts} originais → ${this.stats.totalContacts} únicos (${this.stats.removedContacts} duplicados removidos)`);

        setTimeout(() => {
            this.updateProgress(100, 'Processamento concluído!');
            this.showResults();
        }, 500);
    }

    processContactLine(line) {
        const columns = this.parseCSVLine(line);

        if (columns.length < 19) return [];

        let firstName = columns[0] || '';
        let lastName = columns[2] || '';
        let phoneValue = columns[18] || '';

        // Limpar e validar nome
        let cleanedFirstName = this.cleanName(firstName);
        let cleanedLastName = this.cleanName(lastName);

        // Se não há nome válido, usar nome padrão
        if (!cleanedFirstName && !cleanedLastName) {
            const defaultName = document.getElementById('defaultName').value || 'Cliente';
            cleanedFirstName = defaultName;
            this.usedDefaultNames++;

            this.removedNames.push({
                originalFirst: firstName,
                originalLast: lastName,
                reason: `Nome inválido - usado padrão: "${defaultName}"`
            });
        }

        // Processar múltiplos números separados por :::
        const phoneNumbers = phoneValue.split(':::').map(p => p.trim()).filter(p => p);

        if (phoneNumbers.length === 0) {
            this.removedNumbers.push({
                original: phoneValue,
                reason: 'Nenhum número encontrado'
            });
            return [];
        }

        const validLines = [];

        phoneNumbers.forEach(singlePhone => {
            const formattedPhone = this.formatBrazilianPhone(singlePhone);

            if (formattedPhone && this.isValidBrazilianPhone(formattedPhone)) {
                // Criar nova linha para cada número válido
                const newColumns = [...columns];
                newColumns[0] = cleanedFirstName;
                newColumns[2] = cleanedLastName;
                newColumns[18] = formattedPhone;

                validLines.push(this.arrayToCSVLine(newColumns));
            } else {
                this.removedNumbers.push({
                    original: singlePhone,
                    reason: 'Número inválido ou DDD inexistente'
                });
            }
        });

        return validLines;
    }

    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];

            if (char === '"') {
                if (inQuotes && line[i + 1] === '"') {
                    current += '"';
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (char === ',' && !inQuotes) {
                result.push(current);
                current = '';
            } else {
                current += char;
            }
        }

        result.push(current);
        return result;
    }

    arrayToCSVLine(array) {
        return array.map(field => {
            if (field.includes(',') || field.includes('"') || field.includes('\n')) {
                return '"' + field.replace(/"/g, '""') + '"';
            }
            return field;
        }).join(',');
    }

    processContactLineUnique(line) {
        const columns = this.parseCSVLine(line);
        if (columns.length < 19) return; // Linha incompleta

        const firstName = columns[0] || '';
        const middleName = columns[1] || '';
        const lastName = columns[2] || '';
        let phoneValue = columns[18] || '';

        // Limpar nomes
        let cleanedFirstName = this.cleanName(firstName);
        let cleanedMiddleName = this.cleanName(middleName);
        let cleanedLastName = this.cleanName(lastName);

        // Lógica inteligente de seleção de nome
        let finalFirstName = '';
        let finalLastName = '';
        
        // Prioridade: First Name > Last Name > Middle Name
        if (cleanedFirstName) {
            finalFirstName = cleanedFirstName;
        } else if (cleanedLastName) {
            finalFirstName = cleanedLastName;
        } else if (cleanedMiddleName) {
            finalFirstName = cleanedMiddleName;
        }

        // Se não tem nome válido, usar padrão
        if (!finalFirstName) {
            const defaultName = document.getElementById('defaultName').value || 'Cliente';
            finalFirstName = defaultName;
            this.usedDefaultNames++;
        }

        // Marcar para usar Name da API se necessário
        const useApiName = !finalFirstName || finalFirstName === (document.getElementById('defaultName').value || 'Cliente');

        // Processar números de telefone
        if (!phoneValue) return; // Sem número = contato inútil

        const phoneNumbers = phoneValue.split(':::').map(p => p.trim()).filter(p => p);

        phoneNumbers.forEach(singlePhone => {
            const formattedPhone = this.formatBrazilianPhone(singlePhone);

            if (formattedPhone && this.isValidBrazilianPhone(formattedPhone)) {
                // Verificar se número já existe
                if (this.uniqueContacts.has(formattedPhone)) {
                    // Número duplicado - melhorar dados existentes se possível
                    const existing = this.uniqueContacts.get(formattedPhone);

                    // Se o existente tem nome padrão e este tem nome real, atualizar
                    if (existing.isDefaultName && (cleanedFirstName || cleanedLastName)) {
                        existing.firstName = cleanedFirstName || existing.firstName;
                        existing.lastName = cleanedLastName || existing.lastName;
                        existing.isDefaultName = false;

                        // Recriar linha CSV atualizada
                        const newColumns = [...columns];
                        newColumns[0] = existing.firstName;
                        newColumns[2] = existing.lastName;
                        newColumns[18] = formattedPhone;
                        existing.csvLine = this.arrayToCSVLine(newColumns);
                    }

                    // Log do duplicado rejeitado
                    this.removedNumbers.push({
                        number: singlePhone,
                        reason: `Duplicado de ${formattedPhone}`
                    });
                } else {
                    // Número único - adicionar ao mapa
                    const newColumns = [...columns];
                    newColumns[0] = finalFirstName;
                    newColumns[2] = finalLastName;
                    newColumns[18] = formattedPhone;

                    this.uniqueContacts.set(formattedPhone, {
                        firstName: finalFirstName,
                        lastName: finalLastName,
                        phone: formattedPhone,
                        isDefaultName: useApiName,
                        useApiName: useApiName,
                        csvLine: this.arrayToCSVLine(newColumns)
                    });
                }
            } else {
                // Número inválido
                this.removedNumbers.push({
                    number: singlePhone,
                    reason: 'Número inválido ou DDD incorreto'
                });
            }
        });
    }

    cleanName(name) {
        if (!name || name === '.' || name === '...' || name === '…') return '';

        // Corrigir encoding duplo primeiro
        let fixed = this.fixDoubleEncoding(name);

        // Remover caracteres especiais no início e fim
        let cleaned = fixed
            .replace(/^[.\s@…]+|[.\s@…]+$/g, '')
            .replace(/[^\w\sÀ-ÿ-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

        // Se nome tem apenas 1 caractere, ainda é válido
        if (cleaned.length < 1 || /^\d+$/.test(cleaned)) {
            return '';
        }

        // Verificar se não é apenas caracteres especiais ou palavras genéricas muito específicas
        const invalidNames = ['cliente pod', 'cliente site', 'pod cliente', 'clientes', 'cliente'];
        if (invalidNames.includes(cleaned.toLowerCase())) {
            return '';
        }

        // Aceitar nomes comuns como "Cliente", "Site", etc.
        return cleaned;
    }

    fixDoubleEncoding(text) {
        if (!text) return text;

        // Sistema inteligente de correção UTF-8 mojibake
        let fixed = text;

        // 1. CORREÇÃO INTELIGENTE: Mapeamento direto de caracteres mojibake
        const mojibakeMap = {
            // Acentos agudos
            'Ã¡': 'á', 'Ã©': 'é', 'Ã­': 'í', 'Ã³': 'ó', 'Ãº': 'ú', 'Ã½': 'ý',
            'Ã‰': 'É', 'Ã"': 'Ó', 'Ãš': 'Ú',
            
            // Acentos graves  
            'Ã ': 'à', 'Ã€': 'À', 'Ã¨': 'è', 'Ãˆ': 'È', 'Ã¬': 'ì', 'ÃŒ': 'Ì',
            'Ã¹': 'ù', 'Ã™': 'Ù',
            
            // Circunflexos
            'Ã¢': 'â', 'Ã‚': 'Â', 'Ãª': 'ê', 'ÃŠ': 'Ê', 'Ã®': 'î', 'ÃŽ': 'Î',
            'Ã´': 'ô', 'Ã"': 'Ô', 'Ã»': 'û', 'Ã›': 'Û',
            
            // Til
            'Ã£': 'ã', 'Ãƒ': 'Ã', 'Ãµ': 'õ', 'Ã•': 'Õ', 'Ã±': 'ñ', 'Ã\'': 'Ñ',
            
            // Tremas
            'Ã¤': 'ä', 'Ã„': 'Ä', 'Ã«': 'ë', 'Ã‹': 'Ë', 'Ã¯': 'ï',
            'Ã¶': 'ö', 'Ã–': 'Ö', 'Ã¼': 'ü', 'Ãœ': 'Ü',
            
            // Cedilha
            'Ã§': 'ç', 'Ã‡': 'Ç',
            
            // Caracteres especiais
            'Â ': ' ', 'Âº': 'º', 'Âª': 'ª', 'Â°': '°', 'Â®': '®', 'Â©': '©'
        };

        // 2. APLICAR CORREÇÕES: Substitui todos os caracteres mojibake
        for (const [mojibake, correct] of Object.entries(mojibakeMap)) {
            // Regex global e case-insensitive para capturar todas as ocorrências
            const regex = new RegExp(mojibake.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            fixed = fixed.replace(regex, correct);
        }


        return fixed;
    }

    normalizeApiUrl(url) {
        if (!url) return '';

        // Remove espaços e barras finais
        let normalized = url.trim().replace(/\/+$/, '');

        // Regex para validar formatos aceitos
        const apiUrlRegex = /^(https?:\/\/)?(api\.relaxnarguiles\.com)(\/.*)?$/i;

        if (apiUrlRegex.test(normalized)) {
            // Se não tem protocolo, adiciona https://
            if (!normalized.startsWith('http')) {
                normalized = 'https://' + normalized;
            }
            // Remove path extra se houver
            normalized = normalized.replace(/^(https?:\/\/api\.relaxnarguiles\.com).*/, '$1');
            return normalized;
        }

        // Se não é da API esperada, retorna como está (para outras APIs)
        if (!normalized.startsWith('http')) {
            normalized = 'https://' + normalized;
        }

        return normalized;
    }

    formatBrazilianPhone(phone) {
        if (!phone) return '';

        const defaultDDD = document.getElementById('defaultDDD').value || '19';

        // Extrair apenas números
        let numbers = phone.replace(/\D/g, '');

        // Remover zero inicial (019 -> 19)
        if (numbers.startsWith('0') && numbers.length >= 3) {
            numbers = numbers.substring(1);
        }

        // Remover código do país 55 se já existir
        if (numbers.startsWith('55') && numbers.length > 11) {
            numbers = numbers.substring(2);
        }

        // Casos especiais de formatação
        if (numbers.length === 8) {
            // Apenas número local (99693858) -> adicionar DDD padrão
            numbers = defaultDDD + numbers;
        } else if (numbers.length === 9) {
            // Número local com 9 dígitos (999693858) -> adicionar DDD padrão
            numbers = defaultDDD + numbers;
        }

        // Validar comprimento final (10 ou 11 dígitos após DDD)
        if (numbers.length === 11 || numbers.length === 10) {
            // Sempre retornar com código do país 55
            return '55' + numbers;
        }

        return '';
    }

    isValidBrazilianPhone(phone) {
        if (!phone) return false;

        // Verificar se tem 12 ou 13 dígitos (55 + 10/11 dígitos)
        if (phone.length !== 12 && phone.length !== 13) return false;

        // Verificar se começa com 55
        if (!phone.startsWith('55')) return false;

        const withoutCountryCode = phone.substring(2);
        const ddd = withoutCountryCode.substring(0, 2);

        // DDDs válidos do Brasil
        const validDDDs = [
            '11', '12', '13', '14', '15', '16', '17', '18', '19', // SP
            '21', '22', '24', // RJ
            '27', '28', // ES
            '31', '32', '33', '34', '35', '37', '38', // MG
            '41', '42', '43', '44', '45', '46', // PR
            '47', '48', '49', // SC
            '51', '53', '54', '55', // RS
            '61', // DF
            '62', '64', // GO
            '63', // TO
            '65', '66', // MT
            '67', // MS
            '68', // AC
            '69', // RO
            '71', '73', '74', '75', '77', // BA
            '79', // SE
            '81', '87', // PE
            '82', // AL
            '83', // PB
            '84', // RN
            '85', '88', // CE
            '86', '89', // PI
            '91', '93', '94', // PA
            '92', '97', // AM
            '95', // RR
            '96', // AP
            '98', '99' // MA
        ];

        return validDDDs.includes(ddd);
    }

    updateProgress(percentage, message) {
        document.getElementById('progressFill').style.width = percentage + '%';
        document.getElementById('processingInfo').innerHTML = `<p>${message}</p>`;
    }

    showResults() {
        document.getElementById('processingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'block';

        document.getElementById('identifiedContacts').textContent = this.stats.identifiedContacts;
        document.getElementById('totalContacts').textContent = this.stats.totalContacts;
        document.getElementById('removedContacts').textContent = this.stats.removedContacts;
        document.getElementById('defaultNamesUsed').textContent = this.usedDefaultNames;

        // Mostrar botão de debug apenas se houver números ou nomes removidos
        if (this.removedNumbers.length > 0 || this.removedNames.length > 0) {
            document.getElementById('toggleDebug').style.display = 'block';
        }

        // Mostrar seção WhatsApp se há contatos válidos
        if (this.stats.totalContacts > 0) {
            document.getElementById('whatsappInfo').style.display = 'block';
        }
    }

    downloadProcessedFile() {
        if (!this.processedData) {
            alert('Nenhum arquivo processado disponível para download.');
            return;
        }

        // Gerar CSV otimizado para plugin WordPress
        const optimizedCsv = this.generateOptimizedCSV();

        const blob = new Blob([optimizedCsv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'contatos_formatados_otimizado.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    generateOptimizedCSV() {
        if (!this.uniqueContacts) return '';

        // Cabeçalho otimizado para plugin WordPress
        const header = 'nome,telefone,usar_api_name,api_name,observacoes';
        const lines = [header];

        this.uniqueContacts.forEach(contact => {
            const useApiName = contact.useApiName ? 'SIM' : 'NAO';
            const observacoes = contact.useApiName ? 'Nome genérico - usar Name da API' : 'Nome válido encontrado';
            
            // Buscar nome da API se disponível
            let apiName = '';
            if (this.whatsappResults && this.whatsappResults.length > 0) {
                const apiResult = this.whatsappResults.find(result => result.number === contact.phone);
                if (apiResult && apiResult.apiName) {
                    apiName = apiResult.apiName;
                }
            }
            
            lines.push(`${contact.firstName},${contact.phone},${useApiName},"${apiName}","${observacoes}"`);
        });

        return lines.join('\n');
    }

    generateFinalCSV() {
        if (!this.uniqueContacts) return '';

        // Cabeçalho final para plugin WordPress
        const header = 'nome_final,telefone,origem_nome,observacoes';
        const lines = [header];

        this.uniqueContacts.forEach(contact => {
            // FILTRAR APENAS NÚMEROS VÁLIDOS DO WHATSAPP
            if (this.whatsappResults && this.whatsappResults.length > 0) {
                const apiResult = this.whatsappResults.find(result => result.number === contact.phone);
                if (!apiResult || !apiResult.valid) {
                    return; // Pular números inválidos ou não validados
                }
            }

            let finalName = contact.firstName;
            let origemNome = 'Formatador';
            let observacoes = 'Nome válido encontrado no CSV';
            
            // LÓGICA DE PRIORIDADE CORRIGIDA:
            // 1. Nome real (do CSV, se válido)
            // 2. Name da API (se disponível)
            // 3. Cliente (nome padrão configurado)
            
            if (!contact.useApiName) {
                // Caso 1: Nome real válido encontrado no CSV
                finalName = contact.firstName;
                origemNome = 'Formatador';
                observacoes = 'Nome válido encontrado no CSV';
            } else {
                // Caso 2: Nome genérico - tentar API primeiro
                if (this.whatsappResults && this.whatsappResults.length > 0) {
                    const apiResult = this.whatsappResults.find(result => result.number === contact.phone);
                    if (apiResult && apiResult.apiName) {
                        // API retornou nome
                        finalName = apiResult.apiName;
                        origemNome = 'API WhatsApp';
                        observacoes = 'Nome obtido da API WhatsApp';
                    } else {
                        // API não retornou nome - usar padrão
                        finalName = contact.firstName; // Já é o nome padrão
                        origemNome = 'Padrão';
                        observacoes = 'Nome padrão - API não retornou nome';
                    }
                } else {
                    // Sem validação da API - usar padrão
                    finalName = contact.firstName; // Já é o nome padrão
                    origemNome = 'Padrão';
                    observacoes = 'Nome padrão - sem validação da API';
                }
            }
            
            lines.push(`"${finalName}",${contact.phone},"${origemNome}","${observacoes}"`);
        });

        return lines.join('\n');
    }

    downloadFinalCSV() {
        if (!this.uniqueContacts) {
            alert('Nenhum contato processado disponível.');
            return;
        }

        const finalCsv = this.generateFinalCSV();
        const blob = new Blob([finalCsv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'contatos_validados_whatsapp.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }


    resetInterface() {
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('processingSection').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('whatsappInfo').style.display = 'none';
        document.getElementById('whatsappConfig').style.display = 'none';
        document.getElementById('whatsappValidation').style.display = 'none';
        document.getElementById('whatsappDownloadArea').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'block';
        document.getElementById('fileInput').value = '';

        this.originalData = null;
        this.processedData = null;
        this.stats = { identifiedContacts: 0, totalContacts: 0, removedContacts: 0 };
        this.removedNumbers = [];
        this.removedNames = [];
        this.usedDefaultNames = 0;

        // Limpar campos da API
        document.getElementById('serverUrl').value = '';
        document.getElementById('instanceId').value = '';
        document.getElementById('apiKey').value = '';

        // Remover texto de status se existir
        const configStatus = document.querySelector('.config-status');
        if (configStatus) {
            configStatus.remove();
        }
    }

    toggleDebugInfo() {
        const debugSection = document.getElementById('debugSection');
        const removedNumbersList = document.getElementById('removedNumbersList');
        const removedNamesList = document.getElementById('removedNamesList');
        const toggleBtn = document.getElementById('toggleDebug');

        if (debugSection.style.display === 'none') {
            // Gerar lista de números removidos
            let numbersHTML = '<div class="removed-items">';
            this.removedNumbers.forEach((item) => {
                numbersHTML += `
                    <div class="removed-item">
                        <span class="removed-number">${item.original || 'Vazio'}</span>
                        <span class="removed-reason">${item.reason}</span>
                    </div>
                `;
            });
            numbersHTML += '</div>';
            removedNumbersList.innerHTML = numbersHTML;

            // Gerar lista de nomes removidos
            let namesHTML = '<div class="removed-items">';
            this.removedNames.forEach((item) => {
                const displayName = `${item.originalFirst || ''} ${item.originalLast || ''}`.trim();
                namesHTML += `
                    <div class="removed-item">
                        <span class="removed-name">${displayName || 'Vazio'}</span>
                        <span class="removed-reason">${item.reason}</span>
                    </div>
                `;
            });
            namesHTML += '</div>';
            removedNamesList.innerHTML = namesHTML;

            debugSection.style.display = 'block';
            toggleBtn.textContent = '🙈 Ocultar Debug';
        } else {
            debugSection.style.display = 'none';
            toggleBtn.textContent = '🔍 Ver Itens Removidos';
        }
    }

    async validateWhatsApp() {
        // Verificar configurações
        const serverUrl = this.normalizeApiUrl(document.getElementById('serverUrl').value);
        const instanceId = document.getElementById('instanceId').value;
        const apiKey = document.getElementById('apiKey').value;
        const batchSize = parseInt(document.getElementById('batchSize').value) || 50;

        // Atualizar o campo com a URL normalizada
        document.getElementById('serverUrl').value = serverUrl;

        if (!serverUrl || !instanceId || !apiKey) {
            alert('Por favor, preencha todas as configurações da API WhatsApp');
            return;
        }

        // Extrair números da planilha processada
        const numbers = this.extractPhoneNumbers();
        if (numbers.length === 0) {
            alert('Nenhum número encontrado para validação');
            return;
        }

        // Mostrar seção de validação
        document.getElementById('whatsappValidation').style.display = 'block';
        document.getElementById('startValidationBtn').disabled = true;

        // Resetar resultados
        this.whatsappResults = [];
        const stats = { valid: 0, invalid: 0, error: 0 };

        // Processar em lotes
        const totalBatches = Math.ceil(numbers.length / batchSize);

        for (let i = 0; i < totalBatches; i++) {
            const start = i * batchSize;
            const end = Math.min(start + batchSize, numbers.length);
            const batch = numbers.slice(start, end);

            // Atualizar progresso
            const progress = ((i + 1) / totalBatches) * 100;
            document.getElementById('whatsappProgressFill').style.width = progress + '%';
            document.getElementById('whatsappValidationInfo').innerHTML =
                `<p>Validando lote ${i + 1} de ${totalBatches} (${batch.length} números)...</p>`;

            try {
                const result = await this.validateNumbersBatch(serverUrl, instanceId, apiKey, batch);

                // Processar resultado - API Evolution retorna array direto
                if (Array.isArray(result)) {
                    result.forEach((item) => {
                        const isValid = item.exists === true;

                        this.whatsappResults.push({
                            number: item.number,
                            valid: isValid,
                            status: item,
                            name: item.name || null,
                            apiName: item.name || null
                        });

                        if (isValid) {
                            stats.valid++;
                        } else {
                            stats.invalid++;
                        }
                    });
                } else {
                    // Erro no lote - formato inesperado
                    batch.forEach(number => {
                        this.whatsappResults.push({
                            number: number,
                            valid: false,
                            status: { error: 'Formato de resposta inesperado' }
                        });
                        stats.error++;
                    });
                }
            } catch (error) {
                console.error('Erro na validação:', error);

                // Marcar todo o lote como erro
                batch.forEach(number => {
                    this.whatsappResults.push({
                        number: number,
                        valid: false,
                        status: { error: error.message }
                    });
                    stats.error++;
                });
            }

            // Aguardar um pouco entre lotes para não sobrecarregar a API
            if (i < totalBatches - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Finalizar validação
        this.finishWhatsAppValidation(stats);
    }

    extractPhoneNumbers() {
        if (!this.processedData) return [];

        const lines = this.processedData.split('\n');
        const numbers = [];

        // Pular cabeçalho
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const columns = this.parseCSVLine(line);
            if (columns.length >= 19 && columns[18]) {
                // Números já são únicos graças ao processamento com Map
                numbers.push(columns[18]);
            }
        }

        console.log(`Extraídos ${numbers.length} números únicos para validação`);
        console.log('Amostra:', numbers.slice(0, 3));
        return numbers;
    }

    cleanPhoneForAPI(phone) {
        if (!phone) return null;

        // Remover todos os caracteres não numéricos
        let cleaned = phone.replace(/[^\d]/g, '');

        // Deve ter pelo menos 10 dígitos (DDD + número)
        if (cleaned.length < 10) return null;

        // Se tem 13 dígitos e começa com 55, está correto
        if (cleaned.length === 13 && cleaned.startsWith('55')) {
            return cleaned;
        }

        // Se tem 11 dígitos, adicionar código do país (55)
        if (cleaned.length === 11) {
            return '55' + cleaned;
        }

        // Se tem 10 dígitos, adicionar 55 + 9 (celular)
        if (cleaned.length === 10) {
            return '55' + cleaned.substring(0, 2) + '9' + cleaned.substring(2);
        }

        console.warn(`Número rejeitado: ${phone} -> ${cleaned}`);
        return null;
    }

    async validateNumbersBatch(serverUrl, instanceId, apiKey, numbers) {
        const url = `${serverUrl}/chat/whatsappNumbers/${instanceId}`;

        console.log(`Enviando ${numbers.length} números para ${url}`);
        console.log('Números:', numbers.slice(0, 3), '...');

        const payload = { numbers: numbers };
        console.log('Payload:', JSON.stringify(payload).substring(0, 200) + '...');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': apiKey
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`HTTP ${response.status}:`, errorText);
            throw new Error(`HTTP ${response.status}: ${response.statusText} - ${errorText.substring(0, 100)}`);
        }

        const result = await response.json();
        console.log('Resposta da API:', result);
        return result;
    }

    finishWhatsAppValidation(stats) {
        // Atualizar interface
        document.getElementById('whatsappProgressFill').style.width = '100%';
        document.getElementById('whatsappValidationInfo').innerHTML = '<p>✅ Validação concluída!</p>';

        // Mostrar estatísticas
        document.getElementById('whatsappStats').style.display = 'block';
        document.getElementById('validWhatsapp').textContent = stats.valid;
        document.getElementById('invalidWhatsapp').textContent = stats.invalid;
        document.getElementById('errorWhatsapp').textContent = stats.error;

        // Reabilitar botão
        document.getElementById('startValidationBtn').disabled = false;

        // Mostrar botão de download WhatsApp válidos
        if (stats.valid > 0) {
            document.getElementById('whatsappDownloadArea').style.display = 'block';
        }

        // Criar nova versão do CSV com status WhatsApp
        this.addWhatsAppStatusToCSV();
    }

    addWhatsAppStatusToCSV() {
        if (!this.processedData || this.whatsappResults.length === 0) return;

        const lines = this.processedData.split('\n');
        const updatedLines = [];

        // Adicionar coluna WhatsApp Status ao cabeçalho
        if (lines.length > 0) {
            const header = lines[0];
            updatedLines.push(header + ',WhatsApp Status');
        }

        // Mapear resultados por número
        const statusMap = {};
        this.whatsappResults.forEach(result => {
            if (result.valid) {
                const name = result.name ? ` (${result.name})` : '';
                statusMap[result.number] = `Válido${name}`;
            } else if (result.status?.error) {
                statusMap[result.number] = `Erro: ${result.status.error}`;
            } else {
                statusMap[result.number] = 'Inválido';
            }
        });

        // Processar linhas de dados
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const columns = this.parseCSVLine(line);
            if (columns.length >= 19) {
                const phone = columns[18];
                const status = statusMap[phone] || 'Não Validado';

                // Adicionar status à linha
                const updatedLine = line + ',' + status;
                updatedLines.push(updatedLine);
            }
        }

        // Atualizar dados processados
        this.processedData = updatedLines.join('\n');

        // Atualizar texto do botão de download
        document.querySelector('.download-note').textContent =
            'Arquivo com formatação brasileira e validação WhatsApp';
    }

    checkApiInputs() {
        const serverUrl = document.getElementById('serverUrl').value.trim();
        const instanceId = document.getElementById('instanceId').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();

        // Mostrar botão de teste apenas se todos os campos estiverem preenchidos
        const testBtn = document.getElementById('testApiBtn');
        if (serverUrl && instanceId && apiKey) {
            testBtn.style.display = 'block';
        } else {
            testBtn.style.display = 'none';
            document.getElementById('connectionStatus').style.display = 'none';
            document.getElementById('startValidation').style.display = 'none';
        }
    }

    async testApiConnection() {
        const serverUrl = this.normalizeApiUrl(document.getElementById('serverUrl').value);
        const instanceId = document.getElementById('instanceId').value.trim();
        const apiKey = document.getElementById('apiKey').value.trim();

        // Atualizar o campo com a URL normalizada
        document.getElementById('serverUrl').value = serverUrl;

        const statusDiv = document.getElementById('connectionStatus');
        const testBtn = document.getElementById('testApiBtn');

        // Mostrar status de teste
        statusDiv.style.display = 'block';
        statusDiv.className = 'connection-status testing';
        statusDiv.innerHTML = '🔄 Testando conexão...';
        testBtn.disabled = true;

        try {
            const url = `${serverUrl}/instance/connectionState/${instanceId}`;

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'apikey': apiKey
                }
            });

            const result = await response.json();

            if (!response.ok) {
                // Tratar erros específicos da API
                statusDiv.className = 'connection-status error';

                if (response.status === 401) {
                    statusDiv.innerHTML = '❌ API Key inválida. Verifique suas credenciais.';
                } else if (response.status === 404) {
                    const message = result.response?.message?.[0] || 'Instância não encontrada';
                    statusDiv.innerHTML = `❌ ${message}`;
                } else {
                    statusDiv.innerHTML = `❌ Erro HTTP ${response.status}: ${result.error || response.statusText}`;
                }

                document.getElementById('validateWhatsappBtn').disabled = true;
                testBtn.disabled = false; // Reabilitar para novo teste
                return;
            }

            // Verificar se a resposta tem a estrutura esperada
            if (result && result.instance) {
                const state = result.instance.state;

                if (state === 'open') {
                    statusDiv.className = 'connection-status success';
                    statusDiv.innerHTML = '✅ Conexão válida! Instância conectada ao WhatsApp.';

                    // Mostrar botão de iniciar validação
                    document.getElementById('startValidation').style.display = 'block';
                } else {
                    statusDiv.className = 'connection-status error';
                    statusDiv.innerHTML = `⚠️ Instância não conectada ao WhatsApp. Status: ${state}`;
                    document.getElementById('startValidation').style.display = 'none';
                }
            } else {
                statusDiv.className = 'connection-status error';
                statusDiv.innerHTML = '❌ Resposta inválida da API. Verifique a URL do servidor.';
                document.getElementById('startValidation').style.display = 'none';
            }

        } catch (error) {
            console.error('Erro no teste de conexão:', error);
            statusDiv.className = 'connection-status error';

            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                statusDiv.innerHTML = '❌ Erro de conectividade. Verifique a URL do servidor.';
            } else {
                statusDiv.innerHTML = `❌ Erro na conexão: ${error.message}`;
            }

            document.getElementById('startValidation').style.display = 'none';
        }

        testBtn.disabled = false;
    }

    showWhatsAppConfig() {
        // Mostrar seção de configuração
        document.getElementById('whatsappConfig').style.display = 'block';

        // Trocar botão por texto informativo
        const validateBtn = document.getElementById('validateWhatsappBtn');
        validateBtn.style.display = 'none';

        // Adicionar texto de status
        const whatsappInfo = document.getElementById('whatsappInfo');
        if (!whatsappInfo.querySelector('.config-status')) {
            const statusP = document.createElement('p');
            statusP.className = 'config-status';
            statusP.innerHTML = '⚙️ <strong>Configure sua API Evolution abaixo</strong>';
            statusP.style.color = '#128c7e';
            statusP.style.marginTop = '10px';
            whatsappInfo.appendChild(statusP);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ContactFormatter();
});