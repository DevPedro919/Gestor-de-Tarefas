
const todoList = document.getElementById('todo-list');
const inProgressList = document.getElementById('inprogress-list');
const doneList = document.getElementById('done-list');

let draggedItem = null;
let currentTargetList = null;


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

function sortTasksByDate(listElement) {
    const items = Array.from(listElement.querySelectorAll('.list-group-item'));
    
    items.sort((a, b) => {
        const dateA = a.dataset.dueDate || '9999-12-31';
        const dateB = b.dataset.dueDate || '9999-12-31';
        
        if (dateA === dateB) {
            const timeA = a.dataset.dueTime || '23:59';
            const timeB = b.dataset.dueTime || '23:59';
            return timeA.localeCompare(timeB);
        }
        
        return dateA.localeCompare(dateB);
    });

    items.forEach(item => item.remove());
    
    items.forEach((item, index) => {
        setTimeout(() => {
            item.classList.add('task-fade-in');
            listElement.appendChild(item);
            
            setTimeout(() => {
                item.classList.remove('task-fade-in');
            }, 400);
        }, index * 50); 
    });

    saveTasks();
}

function createCompleteBtn() {
    const btn = document.createElement('button');
    btn.className = 'btn-complete';
    btn.textContent = '✓';
    return btn;
}

function createDeleteBtn() {
    const btn = document.createElement('button');
    btn.className = 'btn-delete';
    btn.textContent = 'X';
    return btn;
}

function completeTask(taskItem) {
    taskItem.classList.add('task-completing');
    
    setTimeout(() => {
        taskItem.classList.remove('task-completing');
        taskItem.classList.add('task-fade-out');

        setTimeout(() => {
            taskItem.classList.remove('task-fade-out');
            taskItem.classList.add('task-fade-in');
            
            doneList.appendChild(taskItem);
            taskItem.querySelector('.btn-complete').style.visibility = 'hidden';
            
            setTimeout(() => {
                taskItem.classList.remove('task-fade-in');
            }, 400);
            
            saveTasks();
        }, 400);
    }, 600);
}

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
        completeTask(li);
    });

    deleteBtn.addEventListener('click', () => {
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

function init() {
    loadTasks();

    const lists = [todoList, inProgressList, doneList];

    lists.forEach(list => {
        list.addEventListener('dragover', dragOver);
        list.addEventListener('drop', e => e.preventDefault());

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

    document.getElementById('sort-todo').addEventListener('click', () => {
        sortTasksByDate(todoList);
    });

    document.getElementById('sort-inprogress').addEventListener('click', () => {
        sortTasksByDate(inProgressList);
    });

    const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
    const taskForm = document.getElementById('taskForm');
    const taskTextInput = document.getElementById('taskText');
    const taskDateInput = document.getElementById('taskDate');
    const taskTimeInput = document.getElementById('taskTime');
    const saveTaskBtn = document.getElementById('saveTaskBtn');

    document.querySelectorAll('.btn-add-new').forEach(btn => {
        btn.addEventListener('click', () => {
            currentTargetList = btn.dataset.targetList;
            
            taskForm.reset();
            
            taskModal.show();
            
            setTimeout(() => {
                taskTextInput.focus();
            }, 150);
        });
    });

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
        
        newTask.classList.add('task-fade-in');
        setTimeout(() => {
            newTask.classList.remove('task-fade-in');
        }, 400);
        
        if (currentTargetList === 'done') {
            newTask.querySelector('.btn-complete').style.visibility = 'hidden';
        }
        
        targetList.appendChild(newTask);
        saveTasks();
        
        taskModal.hide();
    });

    taskTextInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveTaskBtn.click();
        }
    });

    document.getElementById('taskModal').addEventListener('hidden.bs.modal', () => {
        taskForm.reset();
        currentTargetList = null;
    });
}
document.addEventListener('DOMContentLoaded', function() {
    const loginIcon = document.querySelector('.login-link');
    const userModal = new bootstrap.Modal(document.getElementById('userModal'));
    
    if (loginIcon) {
      loginIcon.addEventListener('click', function(e) {
        e.preventDefault();

        const isLoggedIn = localStorage.getItem('isLoggedIn');
        
        if (isLoggedIn === 'true') {
          const userData = JSON.parse(localStorage.getItem('userData'));
          if (userData) {
            document.getElementById('userUsername').textContent = userData.username;
            document.getElementById('userAge').textContent = userData.idade;
            document.getElementById('userCPF').textContent = userData.cpf;
            document.getElementById('userEmail').textContent = userData.email;
            
            userModal.show();
          } else {
            alert('Dados do usuário não encontrados.');
          }
        } else {
          window.location.href = '../html/cadastro.html';
        }
      });
    }
  });

window.onload = init;