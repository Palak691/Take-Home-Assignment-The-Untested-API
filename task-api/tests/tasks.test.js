const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService.js');

//Jest = the tool/framework we use to write and run tests and make assertions.
// Supertest is specifically useful for testing HTTP APIs.


describe('GET /tasks', () => {

    beforeEach(() => {
        taskService._reset();
    });

    test('should return all tasks', async () => {
        taskService.create({ title: 'Task 1' });
        taskService.create({ title: 'Task 2' });

        const response = await request(app)
            .get('/tasks');

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0].title).toBe('Task 1');
        expect(response.body[1].title).toBe('Task 2');
    });

});


describe('GET /tasks?status', () => {

    beforeEach(() => {
        taskService._reset();
    });

    test('should return tasks with the requested status', async () => {
        taskService.create({
            title: 'Todo task',
            status: 'todo'
        });

        taskService.create({
            title: 'Completed task',
            status: 'done'
        });

        const response = await request(app)
            .get('/tasks?status=todo');

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(1);
        expect(response.body[0].title).toBe('Todo task');
        expect(response.body[0].status).toBe('todo');
    });

});

describe('GET /tasks pagination', () => {

    beforeEach(() => {
        taskService._reset();
    });

    test('should return tasks for the requested page and limit', async () => {
        taskService.create({ title: 'Task 1' });
        taskService.create({ title: 'Task 2' });
        taskService.create({ title: 'Task 3' });

        const response = await request(app)
            .get('/tasks?page=1&limit=2');

        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveLength(2);
        expect(response.body[0].title).toBe('Task 1');
        expect(response.body[1].title).toBe('Task 2');
    });

    test('should default limit to 10 when only page is given', async () => {
    for (let i = 1; i <= 12; i++) {
        await request(app).post('/tasks').send({ title: `Task ${i}` });
    }
    const response = await request(app).get('/tasks?page=1');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveLength(10);
});

test('should default page to 1 when only limit is given', async () => {
    await request(app).post('/tasks').send({ title: 'Task 1' });
    const response = await request(app).get('/tasks?limit=5');
    expect(response.statusCode).toBe(200);
    expect(response.body[0].title).toBe('Task 1');
});
});



describe('GET /tasks/stats', () => {

    beforeEach(() => {
        taskService._reset();
    });

    test('should return task statistics', async () => {
        taskService.create({
            title: 'Todo task',
            status: 'todo'
        });

        taskService.create({
            title: 'Progress task',
            status: 'in_progress'
        });

        taskService.create({
            title: 'Done task',
            status: 'done'
        });

        const response = await request(app)
            .get('/tasks/stats');

        expect(response.statusCode).toBe(200);
        expect(response.body.todo).toBe(1);
        expect(response.body.in_progress).toBe(1);
        expect(response.body.done).toBe(1);
        expect(response.body.overdue).toBe(0);
    });

    test('should not count tasks without a dueDate as overdue', () => {
    taskService.create({ title: 'No due date', status: 'todo' }); // dueDate defaults to null
    const stats = taskService.getStats();
    expect(stats.overdue).toBe(0);
});
});


describe('POST /tasks', () => {

    beforeEach(() => {
        taskService._reset();
    });

    test('should create a new task', async () => {
        const response = await request(app)
            .post('/tasks')
            .send({
                title: 'Learn testing',
                description: 'Learn Jest and Supertest',
                status: 'todo',
                priority: 'high'
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.title).toBe('Learn testing');
        expect(response.body.description).toBe('Learn Jest and Supertest');
        expect(response.body.status).toBe('todo');
        expect(response.body.priority).toBe('high');
        expect(response.body.id).toBeDefined();
    });

    test('should return 400 when title is missing', async () => {
    const response = await request(app)
        .post('/tasks')
        .send({
            description: 'Task without title'
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
        'title is required and must be a non-empty string'
    );
  });

  test('should return 400 when status is invalid', async () => {
    const response = await request(app)
        .post('/tasks')
        .send({
            title: 'Invalid status task',
            status: 'pending'
        });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe(
        'status must be one of: todo, in_progress, done'
    );
});

 
  test('should return 400 when priority is invalid', async () => {
    const response = await request(app)
        .post('/tasks')
        .send({ title: 'Learning Testing', priority: 'urgent' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('priority must be one of: low, medium, high');
});

test('should return 400 when dueDate is invalid', async () => {
    const response = await request(app)
        .post('/tasks')
        .send({ title: 'Learning Testing', dueDate: 'not-a-date' });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe('dueDate must be a valid ISO date string');
});

});



describe('PUT /tasks/:id', () => {

    beforeEach(() => {
        taskService._reset();
    });

    test('should update an existing task', async () => {
        const task = taskService.create({
            title: 'Original task',
            status: 'todo',
            priority: 'low'
        });

        const response = await request(app)
            .put(`/tasks/${task.id}`)
            .send({
                title: 'Updated task',
                status: 'in_progress',
                priority: 'high'
            });

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(task.id);
        expect(response.body.title).toBe('Updated task');
        expect(response.body.status).toBe('in_progress');
        expect(response.body.priority).toBe('high');
    });


    test('should return 404 when task does not exist', async () => {
        const response = await request(app)
            .put('/tasks/non-existing-id')
            .send({
                title: 'Updated task'
            });

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Task not found');
    });


    test('should return 400 when title is empty', async () => {
        const task = taskService.create({
            title: 'Original task'
        });

        const response = await request(app)
            .put(`/tasks/${task.id}`)
            .send({
                title: ''
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            'title must be a non-empty string'
        );
    });


    test('should return 400 when status is invalid', async () => {
        const task = taskService.create({
            title: 'Original task'
        });

        const response = await request(app)
            .put(`/tasks/${task.id}`)
            .send({
                status: 'pending'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            'status must be one of: todo, in_progress, done'
        );
    });


    test('should return 400 when priority is invalid', async () => {
        const task = taskService.create({
            title: 'Original task'
        });

        const response = await request(app)
            .put(`/tasks/${task.id}`)
            .send({
                priority: 'urgent'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            'priority must be one of: low, medium, high'
        );
    });


    test('should return 400 when dueDate is invalid', async () => {
        const task = taskService.create({
            title: 'Original task'
        });

        const response = await request(app)
            .put(`/tasks/${task.id}`)
            .send({
                dueDate: 'not-a-date'
            });

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe(
            'dueDate must be a valid ISO date string'
        );
    });

});


describe('DELETE /tasks/:id', () => {

    beforeEach(() => {
        taskService._reset();
    });

    test('should delete an existing task', async () => {
        const task = taskService.create({
            title: 'Task to delete'
        });

        const response = await request(app)
            .delete(`/tasks/${task.id}`);

        expect(response.statusCode).toBe(204);
        expect(response.body).toEqual({});

        const tasks = taskService.getAll();
        expect(tasks).toHaveLength(0);
    });


    test('should return 404 when task does not exist', async () => {
        const response = await request(app)
            .delete('/tasks/non-existing-id');

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Task not found');
    });

});


describe('PATCH /tasks/:id/complete', () => {

    beforeEach(() => {
        taskService._reset();
    });

    test('should complete an existing task', async () => {
        const task = taskService.create({
            title: 'Task to complete',
            status: 'todo',
            priority: 'high'
        });

        const response = await request(app)
            .patch(`/tasks/${task.id}/complete`);

        expect(response.statusCode).toBe(200);
        expect(response.body.id).toBe(task.id);
        expect(response.body.status).toBe('done');
        expect(response.body.priority).toBe('medium');
        // Note: completeTask always resets priority to 'medium', even if it was 'high'.
        // This looks unintentional — see bug report. Test documents current behavior.
        // expect(completedTask.priority).toBe('medium');
        expect(response.body.completedAt).toBeDefined();
    });


    test('should return 404 when task does not exist', async () => {
        const response = await request(app)
            .patch('/tasks/non-existing-id/complete');

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Task not found');
    });

});

describe('PATCH /tasks/:id/assign', () => { 
  
    beforeEach(()=>{
        taskService._reset();
    });

    test('shoule assign a task to a user', async () => {
      
        const task = taskService.create({
            title : 'Task To assign' 
        });

    const response = await request(app)
          .patch(`/tasks/${task.id}/assign`)
          .send({
            assignee : 'Palak'
          })

          expect(response.statusCode).toBe(200);
          expect(response.body.id).toBe(task.id);
          expect(response.body.assignee).toBe('Palak')

    });

    test('should return 404 when task does not exist', async()=>{
        
        const response = await request(app)
        .patch(`/tasks/non-existing-id/assign`)
        .send({
            assignee : 'Palak'
        });

        expect(response.statusCode).toBe(404);
        expect(response.body.error).toBe('Task not found');
      
    });

    test('should return 400 when assignee is missing' , async ()=>{
         const task = taskService.create({
            title: 'Task to assign'
        });

      const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({});
        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('assignee is required and must be a non-empty string');
    });
    test('should return 400 when assignee is not a string', async () => {
    const task = taskService.create({ title: 'Task to assign' });

    const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({ assignee: 12345 });

    expect(response.statusCode).toBe(400);

   });

    test('should return 400 when assignee is empty' , async ()=>{
         const task = taskService.create({
            title: 'Task to assign'
        });

      const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({assignee : ''});

        expect(response.statusCode).toBe(400);
        expect(response.body.error).toBe('assignee is required and must be a non-empty string');
    });

    test('should allow reassignment  of assignee' , async ()=>{
         const task = taskService.create({
            title: 'Task to assign'
        });

         await request(app)
            .patch(`/tasks/${task.id}/assign`)
            .send({assignee: 'Rahul'});

      const response = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({assignee : 'Palak'});

        expect(response.statusCode).toBe(200);
        expect(response.body.assignee).toBe('Palak');
    });
 
});



