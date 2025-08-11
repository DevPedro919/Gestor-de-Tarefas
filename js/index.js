// Pega referências das listas
const todoList = document.getElementById('todo-list');
const inProgressList = document.getElementById('inprogress-list');
const doneList = document.getElementById('done-list');

let draggedItem = null;

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
            doneTask.querySelector('.btn-complete').style.visibility = 'hidden';
            doneList.appendChild(doneTask);
        });
    }
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

    completeBtn.addEventListener('click', () => {
        doneList.appendChild(li);
        li.querySelector('.btn-complete').style.visibility = 'hidden';
        saveTasks();
    });

    deleteBtn.addEventListener('click', () => {
        li.remove();
        saveTasks();
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

    // Botões adicionar nova tarefa
    document.querySelectorAll('.btn-add-new').forEach(btn => {
        btn.addEventListener('click', () => {
            const box = btn.closest('.box');
            const ul = box.querySelector('.task-list');

            const taskText = prompt('Digite o nome da nova tarefa:');
            if (!taskText || !taskText.trim()) return;

            const dueDate = prompt('Digite a data de vencimento (AAAA-MM-DD):');
            const dueTime = prompt('Digite o horário de vencimento (HH:MM):');

            const newTask = createTaskItem(taskText.trim(), dueDate, dueTime);
            ul.appendChild(newTask);
            saveTasks();
        });
    });
}

window.onload = init;