# Bug Report — Task Manager API

## 1. Pagination offset calculation
- **Where:** `src/services/taskService.js`, `getPaginated`

- **Expected:** Pagination should calculate the correct starting offset based on the requested page and limit.
For page 2 with a limit of 10 should start from the 11th task.

- **Actual (before fix):** The offset calculaion was incorrect, causing pagination to skip or return the wrong set of tasks 
for certain page/limit combinations.

- **How found:** An integration test for paginated results were incorrect items being returned for a later page.

- **Status:** Fixed - corrected the offset calculation to use (page - 1) * limit.


## 2. Status filter uses substring match
- **Where:** `src/services/taskService.js`, `getByStatus`

- **Expected:**Filtering by status should return only tasks whose status exactly matches the requested status.

- **Actual (before fix):** The implementation used substring matching, which could match values that only contained the requested status instead of exactly matching it.

- **How found:** 
A unit test for status filtering exposed the incorrect matching behavior.

- **Status:** Fixed — changed the filtering logic to use exact status comparison.



## 3. completeTask resets priority to 'medium'
- **Where:** `src/services/taskService.js`, `completeTask`

- **Expected:** Completing a task should change its status to done and set the appropriate completion timestamp without unexpectedly changing other task properties.

- **Actual:** Completing a task resets its priority to medium, even when the task previously had a different priority such as high or low.

- **How found:** A test checking that task properties are preserved when completing a task exposed this behavior.

- **Status:** Not fixed — flagging because it is unclear whether resetting priority is intentional business behavior. This should be confirmed with the product/API requirements before changing it.



## 4. PUT has no field whitelist
- **Where:** `src/routes/tasks.js`, PUT /:id

- **Expected:** The update endpoint should accept only the fields that are intended to be modified on a task.

- **Risk:** Without an explicit field whitelist, clients may be able to add or overwrite unexpected properties on a task object.

- **Status:** Not fixed — Not fixed — noted as a potential risk. A field whitelist should be introduced after confirming which task properties the API is intended to allow clients to update.


## 5. README status values don't match actual code
- **Where:** README.md vs validators.js/taskService.js

- **Details:** The documented status values do not fully match the status values accepted/used by the implementation.

- **Status:** The expected status values should be confirmed with the API owner before updating either the documentation or implementation.