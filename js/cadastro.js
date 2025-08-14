document.addEventListener('DOMContentLoaded', function() {
  const cpfInput = document.getElementById('cpf');
  const cadastroForm = document.getElementById('cadastro-form');
  const loginForm = document.getElementById('login-form');
  const switchToLogin = document.getElementById('switch-to-login');
  const switchToCadastro = document.getElementById('switch-to-cadastro');
  const pageTitle = document.getElementById('page-title');
  const pageDescription = document.getElementById('page-description');

  const successModal = new bootstrap.Modal(document.getElementById('successModal'));

  switchToLogin.addEventListener('click', function(e) {
    e.preventDefault();
    cadastroForm.style.display = 'none';
    loginForm.style.display = 'block';
    pageTitle.textContent = 'Bem vindo a pagina de login';
    pageDescription.textContent = 'Por favor, preencha os campos abaixo para fazer login.';
  });

  switchToCadastro.addEventListener('click', function(e) {
    e.preventDefault();
    loginForm.style.display = 'none';
    cadastroForm.style.display = 'block';
    pageTitle.textContent = 'Bem vindo a pagina de cadastro';
    pageDescription.textContent = 'Por favor, preencha os campos abaixo para se cadastrar.';
  });

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

  const loginEmailInput = document.getElementById('login-email');
  if (loginEmailInput) {
    loginEmailInput.addEventListener('blur', function(e) {
      const email = e.target.value.trim();
      let msg = document.getElementById('login-email-msg');
      
      if (!msg) {
        msg = document.createElement('div');
        msg.id = 'login-email-msg';
        msg.style.fontSize = '0.9em';
        msg.style.marginTop = '4px';
        loginEmailInput.parentElement.appendChild(msg);
      }

      if (email.length > 0) {
        if (email.includes('@')) {
          msg.textContent = '';
          msg.style.color = 'green';
        } else {
          msg.textContent = 'Email deve conter @';
          msg.style.color = 'red';
        }
      } else {
        msg.textContent = '';
      }
    });
  }

  if (cadastroForm && cpfInput) {
    cadastroForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      if (!validarCPF(cpfInput.value)) {
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

      const username = document.getElementById('username').value.trim();
      const idade = document.getElementById('idade').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();

      if (!username || !idade || !email || !password) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
      }

      const userData = {
        username: username,
        idade: idade,
        cpf: cpfInput.value,
        email: email,
        password: password
      };
      
      try {
        localStorage.setItem('userData', JSON.stringify(userData));
        localStorage.setItem('isLoggedIn', 'true');
        
    
        document.getElementById('successMessage').textContent = 'Cadastro realizado com sucesso!';
        successModal.show();
        
        setTimeout(() => {
          window.location.href = '../html/principal.html';
        }, 2000);
      } catch (error) {
        alert('Erro ao salvar os dados. Tente novamente.');
        console.error('Erro ao salvar no localStorage:', error);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value.trim();

      if (!email || !password) {
        alert('Por favor, preencha todos os campos.');
        return;
      }

      if (!email.includes('@')) {
        let msg = document.getElementById('login-email-msg');
        if (!msg) {
          msg = document.createElement('div');
          msg.id = 'login-email-msg';
          msg.style.fontSize = '0.9em';
          msg.style.marginTop = '4px';
          loginEmailInput.parentElement.appendChild(msg);
        }
        msg.textContent = 'Email deve conter @';
        msg.style.color = 'red';
        loginEmailInput.focus();
        return;
      }

      try {
        localStorage.setItem('isLoggedIn', 'true');
        
        document.getElementById('successMessage').textContent = 'Login realizado com sucesso!';
        successModal.show();

        setTimeout(() => {
          window.location.href = '../html/principal.html';
        }, 2000);
      } catch (error) {
        alert('Erro ao fazer login. Tente novamente.');
        console.error('Erro ao salvar no localStorage:', error);
      }
    });
  }
});

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
function verificarCPF() {
  return false;
}