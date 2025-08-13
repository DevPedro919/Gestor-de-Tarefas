// Pega referências das listas
const todoList = document.getElementById('todo-list');
const inProgressList = document.getElementById('inprogress-list');
const doneList = document.getElementById('done-list');

let draggedItem = null;
let currentTargetList = null;

// Salva tarefas no localStorage
function saveTasks() {
    const tasks = {
        todo: [],
        inprogress: [],
        done: []
    };

    todoList.querySelectorAll('.list-group-item').forEach(item => {
        tasks.todo.push({
            text: item.querySelector('.task-text').textContent,
            date: item.dataset.dueDate,
            time: item.dataset.dueTime
        });
    });

    inProgressList.querySelectorAll('.list-group-item').forEach(item => {
        tasks.inprogress.push({
            text: item.querySelector('.task-text').textContent,
            date: item.dataset.dueDate,
            time: item.dataset.dueTime
        });
    });

    doneList.querySelectorAll('.list-group-item').forEach(item => {
        tasks.done.push({
            text: item.querySelector('.task-text').textContent,
            date: item.dataset.dueDate,
            time: item.dataset.dueTime
        });
    });

    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Carrega tarefas do localStorage
function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem('tasks'));
    if (savedTasks) {
        savedTasks.todo.forEach(task => todoList.appendChild(createTaskItem(task.text, task.date, task.time)));
        savedTasks.inprogress.forEach(task => inProgressList.appendChild(createTaskItem(task.text, task.date, task.time)));
        savedTasks.done.forEach(task => {
            const doneTask = createTaskItem(task.text, task.date, task.time);
            doneList.appendChild(doneTask);
        });
    }
}

// Função para ordenar tarefas por data
function sortTasksByDate(listElement) {
    const items = Array.from(listElement.querySelectorAll('.list-group-item'));
    
    items.sort((a, b) => {
        const dateA = a.dataset.dueDate || '9999-12-31'; // Sem data vai para o final
        const dateB = b.dataset.dueDate || '9999-12-31';
        
        if (dateA === dateB) {
            const timeA = a.dataset.dueTime || '23:59';
            const timeB = b.dataset.dueTime || '23:59';
            return timeA.localeCompare(timeB);
        }
        
        return dateA.localeCompare(dateB);
    });

    // Remove todos os itens e adiciona na ordem correta com animação
    items.forEach(item => item.remove());
    
    items.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('task-fade-in');
            listElement.appendChild(item);
            
            // Remove a classe de animação após completar
            setTimeout(() => {
                item.classList.remove('task-fade-in');
            }, 400);
        }, index * 50); // Delay escalonado para efeito visual
    });

    saveTasks();
}

// Cria botão concluir
function createCompleteBtn() {
    const btn = document.createElement('button');
    btn.className = 'btn-complete';
    btn.textContent = '✓';
    return btn;
}

// Cria botão excluir
function createDeleteBtn() {
    const btn = document.createElement('button');
    btn.className = 'btn-delete';
    btn.textContent = 'X';
    return btn;
}

// Função para completar tarefa com animação
function completeTask(taskItem) {
    // Adiciona animação de conclusão
    taskItem.classList.add('task-completing');
    
    // Após a animação de conclusão, faz o fade out
    setTimeout(() => {
        taskItem.classList.remove('task-completing');
        taskItem.classList.add('task-fade-out');
        
        // Após o fade out, move para a lista de concluídos
        setTimeout(() => {
            taskItem.classList.remove('task-fade-out');
            taskItem.classList.add('task-fade-in');
            
            // Move para a lista de concluídos e esconde o botão de completar
            doneList.appendChild(taskItem);
            taskItem.querySelector('.btn-complete').style.visibility = 'hidden';
            
            // Remove a animação de fade in
            setTimeout(() => {
                taskItem.classList.remove('task-fade-in');
            }, 400);
            
            saveTasks();
        }, 400);
    }, 600);
}

// Cria tarefa com texto, data, horário e botões + drag
function createTaskItem(text, date = '', time = '') {
    const li = document.createElement('li');
    li.className = 'list-group-item';
    li.draggable = true;
    li.dataset.dueDate = date;
    li.dataset.dueTime = time;

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = text;

    const dateSpan = document.createElement('span');
    dateSpan.className = 'task-date';
    if (date) {
        dateSpan.textContent = `Até: ${date}`;
        if (time) {
            dateSpan.textContent += ` às ${time}`;
        }
    }

    const btnGroup = document.createElement('div');
    btnGroup.className = 'btn-group';

    const completeBtn = createCompleteBtn();
    const deleteBtn = createDeleteBtn();

    // Usa a nova função de completar com animação
    completeBtn.addEventListener('click', () => {
        completeTask(li);
    });

    deleteBtn.addEventListener('click', () => {
        // Animação de fade out antes de remover
        li.classList.add('task-fade-out');
        setTimeout(() => {
            li.remove();
            saveTasks();
        }, 400);
    });

    btnGroup.appendChild(completeBtn);
    btnGroup.appendChild(deleteBtn);

    li.appendChild(span);
    li.appendChild(dateSpan);
    li.appendChild(btnGroup);

    addDragAndDropEvents(li);

    return li;
}

// Drag and drop handlers
function dragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', null);
}

function dragEnd() {
    this.classList.remove('dragging');
    draggedItem = null;
    saveTasks();
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const list = this;
    const afterElement = getDragAfterElement(list, e.clientY);

    if (afterElement == null) {
        list.appendChild(draggedItem);
    } else {
        list.insertBefore(draggedItem, afterElement);
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.list-group-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function addDragAndDropEvents(taskItem) {
    taskItem.addEventListener('dragstart', dragStart);
    taskItem.addEventListener('dragend', dragEnd);
}

// Função para obter a lista alvo baseado no data-target-list
function getTargetList(targetListName) {
    switch(targetListName) {
        case 'todo':
            return todoList;
        case 'inprogress':
            return inProgressList;
        case 'done':
            return doneList;
        default:
            return todoList;
    }
}

// Inicializa tudo
function init() {
    loadTasks();

    const lists = [todoList, inProgressList, doneList];

    lists.forEach(list => {
        list.addEventListener('dragover', dragOver);
        list.addEventListener('drop', e => e.preventDefault());

        // Corrige tarefas pré-existentes para terem botões, data, horário e drag
        const oldTasks = Array.from(list.children);
        oldTasks.forEach(oldTask => {
            const text = oldTask.querySelector('.task-text')?.textContent || oldTask.textContent.trim();
            const date = oldTask.dataset.dueDate;
            const time = oldTask.dataset.dueTime;
            oldTask.remove();

            const newTask = createTaskItem(text, date, time);

            if (list === doneList) {
                newTask.querySelector('.btn-complete').style.visibility = 'hidden';
            }

            list.appendChild(newTask);
        });
    });

    // Configuração dos botões de ordenação
    document.getElementById('sort-todo').addEventListener('click', () => {
        sortTasksByDate(todoList);
    });

    document.getElementById('sort-inprogress').addEventListener('click', () => {
        sortTasksByDate(inProgressList);
    });

    // Configuração do modal
    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
    const taskForm = document.getElementById('taskForm');
    const taskTextInput = document.getElementById('taskText');
    const taskDateInput = document.getElementById('taskDate');
    const taskTimeInput = document.getElementById('taskTime');
    const saveTaskBtn = document.getElementById('saveTaskBtn');

    // Botões adicionar nova tarefa - agora com modal
    document.querySelectorAll('.btn-add-new').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTargetList = btn.dataset.targetList;
            
            // Limpa o formulário
            taskForm.reset();
            
            // Mostra o modal
            taskModal.show();
            
            // Foca no input de texto
            setTimeout(() => {
                taskTextInput.focus();
            }, 150);
        });
    });

    // Salvar tarefa do modal
    saveTaskBtn.addEventListener('click', () => {
        const taskText = taskTextInput.value.trim();
        
        if (!taskText) {
            taskTextInput.focus();
            return;
        }

        const dueDate = taskDateInput.value;
        const dueTime = taskTimeInput.value;

        const targetList = getTargetList(currentTargetList);
        const newTask = createTaskItem(taskText, dueDate, dueTime);
        
        // Animação de entrada para nova tarefa
        newTask.classList.add('task-fade-in');
        setTimeout(() => {
            newTask.classList.remove('task-fade-in');
        }, 400);
        
        // Se for para a lista "done", esconde o botão de completar
        if (currentTargetList === 'done') {
            newTask.querySelector('.btn-complete').style.visibility = 'hidden';
        }
        
        targetList.appendChild(newTask);
        saveTasks();
        
        // Fecha o modal
        taskModal.hide();
    });

    // Permite salvar com Enter no input de texto
    taskTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveTaskBtn.click();
        }
    });

    // Limpa o formulário quando o modal é fechado
    document.getElementById('taskModal').addEventListener('hidden.bs.modal', () => {
        taskForm.reset();
        currentTargetList = null;
    });
}

window.onload = init;