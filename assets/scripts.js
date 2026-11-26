let dadosAtuais = null;

function toggleProtocol() {
  const body = document.getElementById('protocolBody');
  const btn = document.getElementById('protocolToggleBtn');
  const isCollapsed = body.classList.toggle('collapsed');
  btn.textContent = isCollapsed ? 'Mostrar guia' : 'Ocultar guia';
}

function lerNumero(texto) {
  if (!texto) return NaN;
  const limpo = String(texto).trim().replace(',', '.').replace(/[^0-9.]/g, '');
  return parseFloat(limpo);
}

function classificarITB(valor) {
  if (valor > 1.40) {
    return {
      titulo: 'Artérias Incompressíveis (> 1,40)',
      descricao: 'Sugere calcificação da camada média arterial (comum em diabetes ou doença renal crônica). Recomenda-se avaliação complementar (ex: índice dedo-braço).',
      corTexto: 'status-calcified',
      corBadge: 'bg-calcified'
    };
  } else if (valor >= 1.00) {
    return {
      titulo: 'Normal (1,00 – 1,40)',
      descricao: 'Fluxo arterial periférico preservado, sem evidência hemodinâmica de doença arterial obstrutiva periférica (DAOP).',
      corTexto: 'status-normal',
      corBadge: 'bg-normal'
    };
  } else if (valor >= 0.91) {
    return {
      titulo: 'Limítrofe (0,91 – 0,99)',
      descricao: 'Zona intermediária. Não confirma obstrução severa em repouso, mas indica maior risco cardiovascular e necessidade de acompanhamento.',
      corTexto: 'status-borderline',
      corBadge: 'bg-borderline'
    };
  } else if (valor >= 0.70) {
    return {
      titulo: 'DAOP Leve (0,70 – 0,90)',
      descricao: 'Doença Arterial Obstrutiva Periférica de grau leve. Pode ser assintomática ou cursar com claudicação intermitente aos grandes esforços.',
      corTexto: 'status-mild',
      corBadge: 'bg-mild'
    };
  } else if (valor >= 0.40) {
    return {
      titulo: 'DAOP Moderada (0,40 – 0,69)',
      descricao: 'Comprometimento arterial moderado, frequentemente associado à claudicação intermitente. Requer avaliação vascular especializada.',
      corTexto: 'status-mild',
      corBadge: 'bg-mild'
    };
  } else {
    return {
      titulo: 'DAOP Grave (< 0,40)',
      descricao: 'Obstrução arterial grave com alto risco de isquemia crítica do membro, dor em repouso ou úlceras isquêmicas. Encaminhamento urgente.',
      corTexto: 'status-severe',
      corBadge: 'bg-severe'
    };
  }
}

function atualizarCalculo() {
  const chaves = ['bd', 'be', 'td', 'te'];
  const valores = {};
  let todosValidos = true;

  for (const key of chaves) {
    const inputEl = document.getElementById('pas-' + key);
    const box = document.getElementById('box-' + key);
    const dot = document.getElementById('dot-' + key);

    const val = lerNumero(inputEl.value);

    if (!isNaN(val) && val > 0) {
      valores[key] = val;
      box.classList.add('valid');
      dot.classList.add('filled');
    } else {
      todosValidos = false;
      box.classList.remove('valid');
      dot.classList.remove('filled');
    }
  }

  const placeholder = document.getElementById('placeholder');
  const resultsContent = document.getElementById('results-content');
  const btnPdf = document.getElementById('btn-pdf');

  if (!todosValidos) {
    placeholder.style.display = 'block';
    resultsContent.classList.remove('active');
    btnPdf.disabled = true;
    dadosAtuais = null;
    return;
  }

  const maiorBraquial = Math.max(valores.bd, valores.be);
  const ladoMaior = valores.bd >= valores.be ? 'Braço Direito' : 'Braço Esquerdo';
  const difBraquial = Math.abs(valores.bd - valores.be);

  const itbD = valores.td / maiorBraquial;
  const itbE = valores.te / maiorBraquial;

  const classD = classificarITB(itbD);
  const classE = classificarITB(itbE);

  document.getElementById('braquial-info').innerHTML =
    `<strong>Maior PAS Braquial de referência:</strong> ${maiorBraquial} mmHg (${ladoMaior})`;

  const alertBox = document.getElementById('interbraquial-alert');
  if (difBraquial >= 15) {
    alertBox.textContent = `Atenção: Diferença de ${difBraquial} mmHg entre os braços (≥ 15 mmHg), o que pode sugerir estenose de artéria subclávia ou tronco braquiocefálico.`;
    alertBox.classList.add('show');
  } else {
    alertBox.classList.remove('show');
  }

  const elValD = document.getElementById('val-itb-d');
  const elBadgeD = document.getElementById('badge-itb-d');
  elValD.textContent = itbD.toFixed(2).replace('.', ',');
  elValD.className = `itb-value ${classD.corTexto}`;
  elBadgeD.textContent = classD.titulo;
  elBadgeD.className = `badge ${classD.corBadge}`;
  document.getElementById('desc-itb-d').textContent = classD.descricao;

  const elValE = document.getElementById('val-itb-e');
  const elBadgeE = document.getElementById('badge-itb-e');
  elValE.textContent = itbE.toFixed(2).replace('.', ',');
  elValE.className = `itb-value ${classE.corTexto}`;
  elBadgeE.textContent = classE.titulo;
  elBadgeE.className = `badge ${classE.corBadge}`;
  document.getElementById('desc-itb-e').textContent = classE.descricao;

  placeholder.style.display = 'none';
  resultsContent.classList.add('active');
  btnPdf.disabled = false;

  dadosAtuais = {
    ...valores,
    maiorBraquial,
    ladoMaior,
    difBraquial,
    itbD: itbD.toFixed(2),
    itbE: itbE.toFixed(2),
    classD,
    classE
  };
}

function limparCampos() {
  ['pas-bd', 'pas-be', 'pas-td', 'pas-te'].forEach(id => {
    document.getElementById(id).value = '';
  });
  atualizarCalculo();
}

function abrirModalPDF() {
  if (!dadosAtuais) return;
  document.getElementById('modal-pdf').classList.add('open');
  document.getElementById('paciente-nome').focus();
}

function fecharModalPDF() {
  document.getElementById('modal-pdf').classList.remove('open');
}

function gerarPDF(event) {
  event.preventDefault();
  if (!dadosAtuais) return;

  if (!window.jspdf) {
    alert('A biblioteca de PDF ainda está carregando. Verifique sua conexão com a internet e tente novamente.');
    return;
  }

  const nome = document.getElementById('paciente-nome').value.trim();
  const idade = document.getElementById('paciente-idade').value.trim();

  const agora = new Date();
  const dataFormatada = agora.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const horaFormatada = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFillColor(9, 11, 14);
  doc.rect(0, 0, 210, 34, 'F');
  doc.setFillColor(20, 86, 200);
  doc.rect(0, 32, 210, 3, 'F');

  doc.setTextColor(215, 249, 26);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('RELATÓRIO DE ÍNDICE TORNOZELO-BRAQUIAL (ITB)', 14, 15);
  doc.setTextColor(226, 232, 240);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Data da avaliação: ${dataFormatada} às ${horaFormatada}`, 14, 24);

  doc.setTextColor(15, 23, 42);
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(14, 42, 182, 24, 3, 3, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('DADOS DO PACIENTE', 18, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(`Nome: ${nome}`, 18, 58);
  doc.text(`Idade: ${idade} anos`, 145, 58);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('PRESSÕES ARTERIAIS SISTÓLICAS AFERIDAS (PAS)', 14, 78);

  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.rect(14, 82, 182, 34, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.text(`• Braço Direito (BD): ${dadosAtuais.bd} mmHg`, 18, 91);
  doc.text(`• Braço Esquerdo (BE): ${dadosAtuais.be} mmHg`, 110, 91);
  doc.text(`• Tornozelo Direito (TD): ${dadosAtuais.td} mmHg`, 18, 100);
  doc.text(`• Tornozelo Esquerdo (TE): ${dadosAtuais.te} mmHg`, 110, 100);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(20, 86, 200);
  doc.text(`Referência braquial utilizada (maior PAS): ${dadosAtuais.maiorBraquial} mmHg (${dadosAtuais.ladoMaior})`, 18, 110);

  let yPos = 126;

  if (dadosAtuais.difBraquial >= 15) {
    doc.setFillColor(254, 243, 199);
    doc.roundedRect(14, yPos - 5, 182, 14, 2, 2, 'F');
    doc.setTextColor(146, 64, 14);
    doc.setFontSize(9.5);
    doc.text(`Alerta: Diferença interbraquial de ${dadosAtuais.difBraquial} mmHg (>= 15 mmHg).`, 18, yPos + 3);
    yPos += 18;
  }

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('RESULTADOS E INTERPRETAÇÃO CLÍNICA', 14, yPos);
  yPos += 6;

  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, yPos, 182, 36, 3, 3, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`ITB Direito: ${dadosAtuais.itbD.replace('.', ',')}  —  ${dadosAtuais.classD.titulo}`, 18, yPos + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const linhasD = doc.splitTextToSize(dadosAtuais.classD.descricao, 174);
  doc.text(linhasD, 18, yPos + 17);
  yPos += 42;

  doc.roundedRect(14, yPos, 182, 36, 3, 3, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text(`ITB Esquerdo: ${dadosAtuais.itbE.replace('.', ',')}  —  ${dadosAtuais.classE.titulo}`, 18, yPos + 9);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  const linhasE = doc.splitTextToSize(dadosAtuais.classE.descricao, 174);
  doc.text(linhasE, 18, yPos + 17);
  yPos += 44;

  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  const nota = 'Protocolo: Aferição em decúbito dorsal após 5 a 10 minutos de repouso. Fórmula: ITB = PAS do Tornozelo / Maior PAS Braquial. Este documento serve como apoio à avaliação clínica e não substitui diagnóstico médico.';
  const linhasNota = doc.splitTextToSize(nota, 182);
  doc.text(linhasNota, 14, yPos + 6);

  const nomeArquivo = `ITB_${nome.replace(/\s+/g, '_')}_${dataFormatada.replace(/\//g, '-')}.pdf`;
  doc.save(nomeArquivo);

  fecharModalPDF();
}

document.addEventListener('DOMContentLoaded', function () {
  // Eventos dos 4 campos de pressão
  ['pas-bd', 'pas-be', 'pas-td', 'pas-te'].forEach(id => {
    const campo = document.getElementById(id);
    campo.addEventListener('input', atualizarCalculo);
    campo.addEventListener('keyup', atualizarCalculo);
    campo.addEventListener('change', atualizarCalculo);
  });

  // Pontos clicáveis na figura humana
  document.querySelectorAll('.limb-marker').forEach(dot => {
    dot.addEventListener('click', () => {
      const targetId = dot.getAttribute('data-target');
      if (targetId) document.getElementById(targetId).focus();
    });
  });

  // Botões e controles principais
  document.getElementById('protocolHeader').addEventListener('click', toggleProtocol);
  document.getElementById('btn-limpar').addEventListener('click', limparCampos);
  document.getElementById('btn-calcular').addEventListener('click', atualizarCalculo);
  document.getElementById('btn-pdf').addEventListener('click', abrirModalPDF);
  document.getElementById('btn-cancelar-modal').addEventListener('click', fecharModalPDF);
  document.getElementById('form-pdf').addEventListener('submit', gerarPDF);

  document.getElementById('modal-pdf').addEventListener('click', function (e) {
    if (e.target === this) fecharModalPDF();
  });
});