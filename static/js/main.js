/**
 * NuñezOS · Core System Functionality (main.js)
 * Interactive shell, terminal REPL, digital clock, and OS boot simulation.
 */

(function () {
    'use strict';

    // Helper selection functions
    const $  = (selector, context = document) => context.querySelector(selector);
    const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

    // =========================================================================
    // 1. DIGITAL CLOCK LOGIC
    // =========================================================================
    function initClock() {
        const clockEl = $('#os-clock');
        if (!clockEl) return;

        function updateClock() {
            const date = new Date();
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            clockEl.textContent = `${hours}:${minutes}`;
        }
        
        updateClock();
        setInterval(updateClock, 30000); // Update every 30 seconds
    }

    // Set Copyright Year dynamically
    const yearEl = $('#copyright-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    // =========================================================================
    // 2. SYSTEM BOOT SIMULATION
    // =========================================================================
    function initBootSequence() {
        const bootScreen = $('#boot');
        const fillBar = $('#boot-fill');
        const percentageText = $('#boot-pct');
        const logContainer = $('#boot-log');
        const skipButton = $('#boot-skip');
        const desktopShell = $('#desktop');

        if (!bootScreen || !desktopShell) return;

        // Sequence of funny/cool loading lines with individual simulated latencies
        const bootSteps = [
            { text: 'inicializando kernel nunez_os v1.0.0-cyber',         ms: 180 },
            { text: 'cargando modulos low_code · make · zapier · n8n',    ms: 220 },
            { text: 'montando base_datos · airtable · postgresql · local', ms: 250 },
            { text: 'conectando interfaces de red con erp corporativo',   ms: 300 },
            { text: 'cargando modelos lenguaje natural · openai · anthropic', ms: 280 },
            { text: 'iniciando agentes_ia · control_inventarios · fsm_core', ms: 350 },
            { text: 'optimizando pipelines de automatizacion operativa',  ms: 220 },
            { text: 'verificando integridad de datos en reportes kpi',    ms: 260 },
            { text: 'estableciendo entorno seguro de sesion · guest@user',  ms: 180 },
            { text: 'nunez_os listo · uptime 100% · bienvenido reclutador', ms: 450, status: 'done' }
        ];

        const TOTAL_STEPS = bootSteps.length;

        function makeLogLine(text) {
            const line = document.createElement('div');
            line.className = 'boot-log__line is-current';
            line.innerHTML = `
                <span class="boot-log__cur">› </span>
                <span class="boot-log__line__text">${text}</span>
                <span class="boot-log__line__status"><span class="boot-log__pending"></span></span>
            `;
            return line;
        }

        function completeLine(line, status) {
            if (!line) return;
            line.classList.remove('is-current');
            const statusEl = line.querySelector('.boot-log__line__status');
            if (!statusEl) return;
            const tag = status || 'ok';
            statusEl.innerHTML = `<span class="boot-log__${tag}">[${tag.toUpperCase()}]</span>`;
        }

        function pruneOldLines(maxLines) {
            while (logContainer.children.length > maxLines) {
                logContainer.removeChild(logContainer.firstChild);
            }
        }

        function finishBoot() {
            bootScreen.classList.add('is-hidden');
            desktopShell.setAttribute('aria-hidden', 'false');
            desktopShell.classList.add('is-ready');
            try {
                sessionStorage.setItem('nos_booted', '1');
            } catch (e) {}
        }

        function instantBoot() {
            bootScreen.style.transition = 'none';
            bootScreen.classList.add('is-hidden');
            desktopShell.setAttribute('aria-hidden', 'false');
            desktopShell.classList.add('is-ready');
        }

        function runSequence() {
            let i = 0;
            let previousLine = null;

            function next() {
                if (previousLine) {
                    completeLine(previousLine, bootSteps[i - 1].status);
                }

                if (i >= TOTAL_STEPS) {
                    fillBar.style.width = '100%';
                    percentageText.textContent = '100%';
                    setTimeout(finishBoot, 350);
                    return;
                }

                const step = bootSteps[i];
                const newLine = makeLogLine(step.text);
                logContainer.appendChild(newLine);
                pruneOldLines(5); // Keep log container clean
                previousLine = newLine;

                const progress = Math.floor(((i + 0.5) / TOTAL_STEPS) * 100);
                fillBar.style.width = `${progress}%`;
                percentageText.textContent = `${progress}%`;

                i++;
                setTimeout(next, step.ms);
            }

            next();
        }

        if (skipButton) {
            skipButton.addEventListener('click', finishBoot);
        }

        // Avoid showing boot animation repeatedly in the same session
        let alreadyBooted = false;
        try {
            alreadyBooted = sessionStorage.getItem('nos_booted') === '1';
        } catch (e) {}

        if (alreadyBooted) {
            instantBoot();
        } else {
            runSequence();
        }
    }

    // =========================================================================
    // 3. INTERACTIVE TERMINAL REPL
    // =========================================================================
    function initTerminal() {
        const outContainer = $('#term-out');
        const termInput = $('#term-input');
        const termForm = $('#term-form');

        if (!outContainer || !termInput || !termForm) return;

        const cmdHistory = [];
        let historyPosition = -1;

        function appendLine(htmlContent, typeClass = '') {
            const line = document.createElement('div');
            line.className = 'term__line' + (typeClass ? ` term__line--${typeClass}` : '');
            line.innerHTML = htmlContent;
            outContainer.appendChild(line);
            outContainer.scrollTop = outContainer.scrollHeight;
        }

        function printPrompt(command) {
            appendLine(escapeHTML(command), 'prompt');
        }

        function printOutput(htmlContent) {
            appendLine(htmlContent, 'out');
        }

        function printError(htmlContent) {
            appendLine(htmlContent, 'err');
        }

        function printInfo(htmlContent) {
            appendLine(htmlContent, 'info');
        }

        function escapeHTML(str) {
            return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        }

        // Available terminal commands dictionary
        const shellCommands = {
            help() {
                printOutput('Comandos disponibles en NuñezOS:');
                printInfo('  <strong>whoami</strong>       ¿Quién es Oscar Nuñez Vargas Vargas?');
                printInfo('  <strong>about</strong>        Mi enfoque y filosofía profesional');
                printInfo('  <strong>skills</strong>       Estructura detallada de mis habilidades');
                printInfo('  <strong>proyectos</strong>    Casos de estudio empresariales reales');
                printInfo('  <strong>cv</strong>           Abrir mi currículum en PDF');
                printInfo('  <strong>contacto</strong>     Cómo ponerte en contacto conmigo');
                printInfo('  <strong>ls</strong>           Listar archivos del sistema virtual');
                printInfo('  <strong>cat</strong> &lt;archivo&gt; Mostrar contenido de un archivo (ej: values.md)');
                printInfo('  <strong>uname</strong>        Información del sistema operativo virtual');
                printInfo('  <strong>date</strong>         Mostrar fecha y hora actual');
                printInfo('  <strong>clear</strong>        Limpiar la pantalla de la terminal');
                printInfo('  <strong>fortune</strong>      Un pensamiento rápido sobre tecnología');
            },
            whoami() {
                printOutput('Oscar Nuñez Vargas Vargas');
                printOutput('Creador de Soluciones No-Code & AI');
                printOutput('Especialista en Automatización de Procesos Empresariales');
                printOutput('Apasionado por la optimización operativa y la eficiencia digital.');
            },
            about() {
                printOutput('Soy un creador de soluciones enfocado en llevar la eficiencia al siguiente nivel.');
                printOutput('');
                printOutput('¿Qué hago exactamente?:');
                printOutput('  → Automatizaciones integrales con Make, Zapier y n8n.');
                printOutput('  → Agentes de IA adaptados a procesos de negocio reales.');
                printOutput('  → Creación de portales operativos y apps internas low-code.');
                printOutput('  → Integración profunda entre sistemas legacy, CRMs y hojas de cálculo.');
                printOutput('');
                printOutput('Filosofía: "La mejor automatización es la que simplifica lo complejo sin añadir fricción."');
            },
            skills() {
                printOutput('{');
                printOutput('  "automatizacion": ["Make", "Zapier", "n8n", "Webhooks", "APIs Rest"],');
                printOutput('  "inteligencia_ia": ["OpenAI API", "Anthropic Claude", "AI Agents", "Prompt Engineering"],');
                printOutput('  "plataformas_low_code": ["Airtable", "Bubble", "FlutterFlow", "Google AppSheet"],');
                printOutput('  "bases_datos": ["PostgreSQL", "MySQL", "MongoDB", "SQL Server"],');
                printOutput('  "metodologias": ["Agile", "Scrum", "Procesos de Negocio (BPM)"]');
                printOutput('}');
            },
            cv() {
                printOutput('Abriendo CV en PDF de Oscar Nuñez Vargas Vargas...');
                window.open('./static/docs/cv-oscar-nunez-vargas-vargas-vargas.pdf', '_blank');
            },
            download() {
                this.cv();
            },
            proyectos() {
                printOutput('Proyectos empresariales destacados (Nombres genéricos por confidencialidad):');
                printOutput('');
                printOutput('  · <strong>gestor-campo</strong>      FSM Ticket & Technician Manager. Asignación de servicios técnicos. [open gestor]');
                printOutput('  · <strong>liquidaciones</strong>      Procesamiento automatizado de transacciones financieras y cobros. [open liquidaciones]');
                printOutput('  · <strong>asistente-ia</strong>      Agente conversacional corporativo conectado con datos internos. [open asistente]');
                printOutput('  · <strong>dashboard-kpi</strong>     Tablero centralizado de KPIs y operaciones de desarrollo R&D. [open dashboard]');
            },
            contacto() {
                printOutput('Información de contacto oficial:');
                printOutput('  Email    : <a href="mailto:onunez9418@gmail.com">onunez9418@gmail.com</a>');
                printOutput('  Teléfono : <a href="tel:960560064">960560064</a>');
                printOutput('  LinkedIn : <a href="https://www.linkedin.com/in/oscar-nu%C3%B1ez-636729208" target="_blank" rel="noopener">linkedin.com/in/oscar-nuñez-636729208</a>');
            },
            ls(args) {
                const folder = (args[0] || '/').replace(/^\.\//, '/');
                if (folder === '/' || folder === '~' || folder === '') {
                    printOutput('about.md     values.md     skills.json');
                    printOutput('proyectos/   contacto.txt  uptime.log');
                } else if (folder === 'proyectos' || folder === '/proyectos') {
                    shellCommands.proyectos();
                } else {
                    printError(`ls: no se puede acceder a '${escapeHTML(folder)}': El archivo o carpeta no existe.`);
                }
            },
            cat(args) {
                const target = args[0];
                if (!target) {
                    printError('cat: falta un argumento. Escribe `ls` para ver archivos disponibles.');
                    return;
                }
                const filename = target.replace(/^\.\//, '');
                if (filename === 'about.md') {
                    shellCommands.about();
                } else if (filename === 'skills.json') {
                    shellCommands.skills();
                } else if (filename === 'contacto.txt') {
                    shellCommands.contacto();
                } else if (filename === 'values.md') {
                    printOutput('# VALORES PROFESIONALES');
                    printOutput('');
                    printOutput('1. Foco en Resultados: Medir el éxito por las horas ahorradas y el ROI.');
                    printOutput('2. Simplicidad: Resolver desafíos complejos con soluciones limpias.');
                    printOutput('3. Modularidad: Diseñar flujos fáciles de mantener y escalar.');
                } else if (filename === 'uptime.log') {
                    printOutput('system-up: 100% stable · 2592000 seconds without crash.');
                } else {
                    printError(`cat: ${escapeHTML(filename)}: El archivo no existe.`);
                }
            },
            open(args) {
                const target = (args[0] || '').toLowerCase();
                const redirects = {
                    contacto: 'mailto:onunez9418@gmail.com',
                    telefono: 'tel:960560064',
                    linkedin: 'https://www.linkedin.com/in/oscar-nu%C3%B1ez-636729208',
                    github: 'https://github.com',
                    cv: './static/docs/cv-oscar-nunez-vargas-vargas-vargas.pdf',
                    gestor: '#cases',
                    liquidaciones: '#cases',
                    asistente: '#cases',
                    dashboard: '#cases'
                };
                const url = redirects[target];
                if (!url) {
                    printError(`open: destino '${escapeHTML(target)}' desconocido.`);
                    printInfo(`Opciones: ${Object.keys(redirects).join(' · ')}`);
                    return;
                }
                printOutput(`Abriendo '${escapeHTML(target)}'...`);
                if (url.startsWith('#')) {
                    const el = $(url);
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                    // Close modal
                    $('#term-modal').classList.remove('is-open');
                } else {
                    window.open(url, '_blank');
                }
            },
            uname() {
                printOutput('NuñezOS 1.0.0 #cyber SMP x86_64 GNU/Linux');
                printOutput('host: oscar-nunez-portfolio  ·  kernel: 1.0.0-cyber-nocode');
            },
            date() {
                printOutput(new Date().toLocaleString());
            },
            clear() {
                outContainer.innerHTML = '';
            },
            fortune() {
                const thoughts = [
                    'La mejor automatización es la que elimina la necesidad de una tarea por completo.',
                    'No-code no significa "sin arquitectura". Piensa antes de construir.',
                    'Los agentes de IA son tan potentes como las bases de datos a las que están conectados.',
                    'Un flujo Make ordenado ahorra un 90% del tiempo de mantenimiento. Nombra tus módulos.',
                    'La eficiencia operativa no consiste en trabajar más rápido, sino en eliminar lo innecesario.'
                ];
                const index = Math.floor(Math.random() * thoughts.length);
                printOutput(`"${thoughts[index]}"`);
            },
            sudo() {
                printError('Permiso denegado. Los invitados no tienen acceso a sudo en NuñezOS.');
                printInfo('Tip: Escribe `contacto` para hablar directamente con el administrador del sistema.');
            },
            rm(args) {
                if (args.join(' ') === '-rf /') {
                    printError('Operación denegada. Intentar autodestruir el portafolio del creador no es una buena idea frente a un reclutador.');
                } else {
                    printError('rm: comando no permitido en modo de invitado corporativo.');
                }
            }
        };

        // Command execution engine
        function runCommand(rawInput) {
            const cleanInput = rawInput.trim();
            printPrompt(cleanInput);

            if (!cleanInput) return;

            cmdHistory.push(cleanInput);
            historyPosition = cmdHistory.length;

            const tokens = cleanInput.split(/\s+/);
            const cmdName = tokens[0].toLowerCase();
            const cmdArgs = tokens.slice(1);

            const executionFn = shellCommands[cmdName];
            if (executionFn) {
                try {
                    executionFn(cmdArgs);
                } catch (error) {
                    printError(`Error de ejecución: ${error.message}`);
                }
            } else {
                printError(`Comando no encontrado: '${cmdName}'`);
                printInfo('Escribe `help` para ver la lista de comandos disponibles en el sistema.');
            }
        }

        // Submision events
        termForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const value = termInput.value;
            termInput.value = '';
            runCommand(value);
        });

        // Keybindings for terminal history & clear
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowUp') {
                if (cmdHistory.length === 0) return;
                e.preventDefault();
                historyPosition = Math.max(0, historyPosition - 1);
                termInput.value = cmdHistory[historyPosition] || '';
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                historyPosition = Math.min(cmdHistory.length, historyPosition + 1);
                termInput.value = cmdHistory[historyPosition] || '';
            } else if (e.key === 'l' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                shellCommands.clear();
            }
        });

        // Click events for suggestion buttons
        const suggestionButtons = $$('.term__suggestion-btn');
        suggestionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const cmd = btn.getAttribute('data-cmd');
                if (cmd) {
                    runCommand(cmd);
                    if (termInput) termInput.focus();
                }
            });
        });
    }

    // =========================================================================
    // 4. TERMINAL MODAL MANAGEMENT
    // =========================================================================
    function initModalControl() {
        const modal = $('#term-modal');
        const openTrigger = $('#open-term');
        const footerTrigger = $('#open-term-footer');
        const closeTrigger = $('#term-close');
        const terminalInput = $('#term-input');

        if (!modal) return;

        function openModal() {
            modal.classList.add('is-open');
            setTimeout(() => {
                if (terminalInput) terminalInput.focus();
            }, 80);
        }

        function closeModal() {
            modal.classList.remove('is-open');
        }

        if (openTrigger) {
            openTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }

        if (footerTrigger) {
            footerTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                openModal();
            });
        }

        if (closeTrigger) {
            closeTrigger.addEventListener('click', closeModal);
        }

        // Close on clicking backdrop
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Close on Escape or Toggle with backtick (`)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('is-open')) {
                closeModal();
            }
            if (e.key === '`' || e.key === '~') {
                // Ignore if typing in input/textarea
                const tag = document.activeElement.tagName.toLowerCase();
                if (tag === 'input' || tag === 'textarea') return;
                
                e.preventDefault();
                if (modal.classList.contains('is-open')) {
                    closeModal();
                } else {
                    openModal();
                }
            }
        });

        // Focus keyboard inside terminal on clicking terminal body (except text select)
        modal.addEventListener('click', (e) => {
            if (!modal.contains(e.target) || e.target === modal) return;
            const textSelected = window.getSelection().toString();
            if (textSelected) return;
            if (e.target.closest('.terminal-modal__close, a, button, input')) return;
            if (terminalInput) terminalInput.focus();
        });
    }

    // =========================================================================
    // 5. DESKTOP SHORTCUTS BINDINGS
    // =========================================================================
    function initDesktopShortcuts() {
        const shortcutTerminal = $('#shortcut-terminal');
        const shortcutCv = $('#shortcut-cv');
        const shortcutProjects = $('#shortcut-projects');

        if (shortcutTerminal) {
            shortcutTerminal.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = $('#term-modal');
                if (modal) {
                    modal.classList.add('is-open');
                    const termInput = $('#term-input');
                    setTimeout(() => termInput && termInput.focus(), 80);
                }
            });
        }

        if (shortcutCv) {
            shortcutCv.addEventListener('click', (e) => {
                e.preventDefault();
                window.open('./static/docs/cv-oscar-nunez-vargas-vargas-vargas.pdf', '_blank');
            });
        }

        if (shortcutProjects) {
            shortcutProjects.addEventListener('click', (e) => {
                e.preventDefault();
                const casesSection = $('#cases');
                if (casesSection) {
                    casesSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    // =========================================================================
    // SYSTEM INITIALIZER
    // =========================================================================
    document.addEventListener('DOMContentLoaded', () => {
        initClock();
        initBootSequence();
        initTerminal();
        initModalControl();
        initDesktopShortcuts();
    });

})();
