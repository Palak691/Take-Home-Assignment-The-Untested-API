const taskService = require('../src/services/taskService.js');

//1
describe('taskService.create', () => {

    beforeEach(()=>{
        taskService._reset();
    });
  // each test should start with a clean state

    test('should create a task with default value',()=>{
        const task = taskService.create({
            title : 'Learn Jest'
        });
        expect(task.title).toBe('Learn Jest');
        expect(task.status).toBe('todo');
        expect(task.priority).toBe('medium');
        expect(task.description).toBe('');
        expect(task.dueDate).toBe(null);
        expect(task.completedAt).toBe(null);
        expect(task.id).toBeDefined();
        expect(task.createdAt).toBeDefined()
     });
 
    test('should create a task with provided value',()=>{
        const task = taskService.create({
            title : 'Write tests',
            description : 'Learn Jest and Supertest',
            status : 'in_progress',
            priority : 'high',
            dueDate : '2026-10-01'
        });
        expect(task.title).toBe('Write tests');
        expect(task.status).toBe('in_progress');
        expect(task.priority).toBe('high');
        expect(task.description).toBe('Learn Jest and Supertest');
        expect(task.dueDate).toBe('2026-10-01');
      });
    
    test('should store the created task', () => {
        const task = taskService.create({
         title: 'Learn testing'
      });
      
       const tasks = taskService.getAll();

       expect(tasks).toHaveLength(1);
       expect(tasks[0]).toEqual(task);

    });
 

});

describe('taskService.getAll',()=>{

    beforeEach(()=>{
        taskService._reset();
    });

    test('should return empty array when no tasks exist',()=>{
      const tasks = taskService.getAll();
      expect(tasks).toEqual([])
    });

    test('should return all the tasks created',()=>{
        taskService.create({title : 'Task 1'});
        taskService.create({title : 'Task 2'});
        taskService.create({title : 'Task 3'});

        const tasks = taskService.getAll();
        expect(tasks).toHaveLength(3)
        expect(tasks[0].title).toBe('Task 1')
        // expect(tasks[2].title).toBe('Task 2') === false;
        expect(tasks[2].title).not.toBe('Task 2');

    })

    test('should return a copy, not the live internal array', ()=>{
        taskService.create({title : "Task 1"})

        const tasks = taskService.getAll();

        tasks.push({id : 'fake', title : 'injected'});

        const taskAssign = taskService.getAll();
        expect(taskAssign).toHaveLength(1)
    });

});

describe('taskService.findById',()=>{
     beforeEach(()=>{
        taskService._reset();
    });

    test('should return task when the id exist', ()=>{
        
        const task = taskService.create({
            title : "find this task"
        });

        const result = taskService.findById(task.id);
        expect(result).toBe(task);
    });

    test('should return undefined when the id does not exist', ()=>{

        const result = taskService.findById('fake-id');
        expect(result).toBeUndefined();
    
    });;

    
});



describe('taskService.getByStatus',()=>{
     beforeEach(()=>{
        taskService._reset();
    });

    test('should return tasks with the given status', ()=>{
        
         taskService.create({
            title : 'Task 1',
            status : 'todo'
        });

         taskService.create({
            title : 'Task 2',
            status : 'done'
        });
         taskService.create({
            title : 'Task 3',
            status : 'todo'
        });

        const result = taskService.getByStatus('todo');

        expect(result).toHaveLength(2);
        expect(result[0].title).toBe('Task 1');
        expect(result[1].title).toBe('Task 3');
    });

    test('should not return tasks for a partial status', () => {
         taskService.create({
            title: 'Task 1',
            status: 'in_progress'
        });

    const result = taskService.getByStatus('progress');

    expect(result).toHaveLength(0);
});

    
});


//
describe('taskService.getPaginated',()=>{

     beforeEach(()=>{
        taskService._reset();
    });

    test('should return first page of tasks', ()=>{
         taskService.create({
            title : 'Task 1',
        });
         taskService.create({
            title : 'Task 2',
        });
         taskService.create({
            title : 'Task 3',
        });
         taskService.create({
            title : 'Task 4',
        });
         taskService.create({
            title : 'Task 5',
        });
         taskService.create({
            title : 'Task 6',
        });


        const result = taskService.getPaginated(1,2);

        expect(result).toHaveLength(2);
        expect(result[0].title).toBe('Task 1');
        expect(result[1].title).toBe('Task 2');
    });



    
});

describe('taskService.getStats',()=>{

     beforeEach(()=>{
        taskService._reset();
    });

    test('should return correct task count by status', ()=>{
         taskService.create({
            title : 'Task 1',
            status : 'todo'
        });
         taskService.create({
            title : 'Task 2',
            status : 'todo'

        });
         taskService.create({
            title : 'Task 3',
            status : 'in_progress'

        });
        taskService.create({
            title : 'Task 3',
            status : 'done'

        });
        
        const stats = taskService.getStats();

        expect(stats.todo).toBe(2);
        expect(stats.in_progress).toBe(1);
        expect(stats.done).toBe(1);
        expect(stats.overdue).toBe(0);
    });
    
    test('should count overdue tasks',()=>{

        taskService.create({
            title : 'Overdue task',
            status : 'todo',
            dueDate: '2020-01-01'
        })
         taskService.create({
            title : 'Completed overdue task',
            status : 'done',
            dueDate: '2020-01-01'
        })
         taskService.create({
            title : 'Future task',
            status : 'todo',
            dueDate: '2028-01-01'
        })

       const stats = taskService.getStats();

        expect(stats.overdue).toBe(1);
    })

    
});



describe('taskService.update', () => {

    beforeEach(() => {
        taskService._reset();
    });

    test('should update an existing task', () => {
        const task = taskService.create({
            title: 'Learn Jest',
            priority: 'medium'
        });

        const updatedTask = taskService.update(task.id, {
            title: 'Learn Jest and Supertest',
            priority: 'high'
        });

        expect(updatedTask.title).toBe('Learn Jest and Supertest');
        expect(updatedTask.priority).toBe('high');
        expect(updatedTask.id).toBe(task.id);
    });

    test('should return null when the task does not exist', () => {
        const result = taskService.update('fake-id', {
            title: 'Updated task'
        });
    
        expect(result).toBeNull();
    });
});




describe('taskService.remove', () => {

    beforeEach(() => {
        taskService._reset();
    });

    test('should remove an existing task', () => {
        const task = taskService.create({
            title: 'Delete this task'
        });

        const result = taskService.remove(task.id);

        expect(result).toBe(true);
        expect(taskService.getAll()).toHaveLength(0);
    });

    test('should return false when the task does not exist', () => {
    const result = taskService.remove('fake-id');

    expect(result).toBe(false);
});

});



describe('taskService.completeTask', () => {

    beforeEach(() => {
        taskService._reset();
    });

    test('should mark a task as completed', () => {
        const task = taskService.create({
            title: 'Finish assignment',
            status: 'in_progress',
            priority: 'high'
        });

        const completedTask = taskService.completeTask(task.id);

        expect(completedTask.status).toBe('done');
        expect(completedTask.priority).toBe('medium');
        expect(completedTask.completedAt).toBeDefined();
        expect(completedTask.id).toBe(task.id);
    });
    

    test('should return null when the task does not exist', () => {
    const result = taskService.completeTask('fake-id');

    expect(result).toBeNull();
});
});


