document.addEventListener('DOMContentLoaded', function() {
  const cpfInput = document.getElementById('cpf');
  const form = document.querySelector('form');
  if (cpfInput) {
    cpfInput.addEventListener('input', function(e) {
      let value = e.target.value.replace(/\D/g, '');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
      e.target.value = value;
    });

    cpfInput.addEventListener('blur', function(e) {
      const isValid = validarCPF(e.target.value);
      let msg = document.getElementById('cpf-msg');
      if (!msg) {
        msg = document.createElement('div');
        msg.id = 'cpf-msg';
        msg.style.fontSize = '0.9em';
        msg.style.marginTop = '4px';
        cpfInput.parentElement.appendChild(msg);
      }
      if (e.target.value.length === 14) {
        if (isValid) {
          msg.textContent = null;
          msg.style.color = 'green';
        } else {
          msg.textContent = 'CPF inválido';
          msg.style.color = 'red';
        }
      } else {
        msg.textContent = '';
      }
    });
  }

  // Impede o envio do formulário se o CPF for inválido
if (form && cpfInput) {
  form.addEventListener('submit', function(e) {
    if (!validarCPF(cpfInput.value)) {
      e.preventDefault();
      let msg = document.getElementById('cpf-msg');
      if (!msg) {
        msg = document.createElement('div');
        msg.id = 'cpf-msg';
        msg.style.fontSize = '0.9em';
        msg.style.marginTop = '4px';
        cpfInput.parentElement.appendChild(msg);
      }
      msg.textContent = 'CPF inválido. Corrija antes de cadastrar.';
      msg.style.color = 'red';
      cpfInput.focus();
      return;
    }

    // Salva os dados no localStorage
    const userData = {
      username: document.getElementById('username').value,
      idade: document.getElementById('idade').value,
      cpf: cpfInput.value,
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    };
    localStorage.setItem('userData', JSON.stringify(userData));

    // Redireciona para a página principal
    e.preventDefault();
    window.location.href = '../html/principal.html';
  });
}
});

// Função de validação de CPF (algoritmo da Receita)
function validarCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let soma = 0, resto;

  for (let i = 1; i <= 9; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(9, 10))) return false;

  soma = 0;
  for (let i = 1; i <= 10; i++)
    soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  resto = (soma * 10) % 11;
  if ((resto === 10) || (resto === 11)) resto = 0;
  if (resto !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}