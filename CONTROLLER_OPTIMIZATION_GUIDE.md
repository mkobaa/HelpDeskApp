# Controller Optimization Guide - Layered Architecture Refactoring

**Project:** HelpDeskApp Ticket System  
**Date:** January 27, 2026  
**Status:** Architecture Improvement Recommendations

---

## Table of Contents
1. [Current Architecture Overview](#current-architecture-overview)
2. [Layered Architecture Pattern](#layered-architecture-pattern)
3. [Controller-by-Controller Analysis](#controller-by-controller-analysis)
4. [Implementation Priorities](#implementation-priorities)
5. [Code Examples & Best Practices](#code-examples--best-practices)

---

## Current Architecture Overview

### Existing Structure
```
✅ Already Implemented:
- Services: SurveyService, TicketHistoryService, TicketService, TimeTrackingService
- Services: NotificationStreamService, SseAuthResolver (just added)
- Policies: TicketPolicy

❌ Missing Architecture:
- No Request/FormRequest classes for validation
- Business logic mixed in controllers
- No Repository pattern
- Missing DTOs (Data Transfer Objects)
- No Resource/Transformer classes for API responses
- Limited authorization policies
- No dedicated Query Services
```

---

## Layered Architecture Pattern

### Recommended Layer Structure

```
┌─────────────────────────────────────────┐
│  1. ROUTES (routes/api.php)             │
│     - Route definitions only            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  2. CONTROLLERS                          │
│     - Orchestration ONLY                 │
│     - Input validation (via Requests)    │
│     - Call services                      │
│     - Return responses (via Resources)   │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  3. FORM REQUESTS                        │
│     - Validation rules                   │
│     - Authorization checks               │
│     - Data sanitization                  │
└──────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  4. SERVICES (Business Logic)            │
│     - Core business rules                │
│     - Transaction coordination           │
│     - Call repositories                  │
│     - Fire events                        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  5. REPOSITORIES (Data Access)           │
│     - Database queries                   │
│     - Model interactions                 │
│     - Query optimization                 │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│  6. MODELS (Eloquent)                    │
│     - Relationships                      │
│     - Accessors/Mutators                 │
│     - Scopes                             │
└──────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  CROSS-CUTTING CONCERNS                  │
├─────────────────────────────────────────┤
│  • Policies: Authorization logic         │
│  • Events: Domain events                 │
│  • Listeners: Event handlers             │
│  • Jobs: Async tasks                     │
│  • DTOs: Data transfer objects           │
│  • Resources: API response formatting    │
│  • Middleware: Request filtering         │
└─────────────────────────────────────────┘
```

---

## Controller-by-Controller Analysis

---

### 1. **AuthController** ⚠️ HIGH PRIORITY

**Current Issues:**
- Direct model access in controller
- Password hashing logic in controller
- Token management in controller
- Business logic mixed with HTTP concerns
- No rate limiting consideration
- Hardcoded token name

**Current Code Problems:**
```php
// ❌ Bad: Business logic in controller
$user = User::where('email', $request->email)->first();
if (!$user || !Hash::check($request->password, $user->password)) {
    throw ValidationException::withMessages([...]);
}
$user->tokens()->where('name', 'api-token')->delete();
```

**Recommended Refactoring:**

```
AuthController (Thin)
    ├── LoginRequest (Validation)
    ├── AuthService
    │   ├── authenticate(credentials)
    │   ├── checkUserStatus(user)
    │   └── generateToken(user)
    ├── UserRepository
    │   └── findByEmail(email)
    └── UserResource (Response)
```

**Specific Improvements:**

1. **Create FormRequests:**
   - `LoginRequest` - email/password validation + rate limiting
   - `LogoutRequest` - optional, for additional security checks

2. **Create AuthService:**
   ```php
   class AuthService {
       public function authenticate(string $email, string $password): User
       public function generateToken(User $user, string $tokenName = 'api-token'): string
       public function revokeTokens(User $user, string $tokenName): void
       public function checkUserStatus(User $user): void // throws if inactive
   }
   ```

3. **Create UserRepository:**
   ```php
   class UserRepository {
       public function findByEmail(string $email): ?User
       public function findActiveByEmail(string $email): ?User
   }
   ```

4. **Create Policies:**
   - `UserPolicy` - check if user can login (is_active check)

5. **Add Resources:**
   - `AuthUserResource` - standardize login response

**Priority:** HIGH - Authentication is critical security concern

---

### 2. **TicketsController** ⚠️ CRITICAL - MOST COMPLEX

**Current Issues:**
- 304 lines - violates Single Responsibility Principle
- Multiple concerns: listing, creation, assignment, status updates, workload, history
- Direct DB queries and transactions in controller
- File upload logic mixed with business logic
- Complex filtering logic
- Role-based logic scattered throughout

**Current Code Problems:**
```php
// ❌ Bad: Transaction logic in controller
$ticket = DB::transaction(function () use ($data, $userId, $attachments) {
    $ticket = Ticket::create([...]);
    $ticket->timeTracking()->create([...]);
    // File handling
    // Bulk insert
    // History logging
    return $ticket;
});
```

**Recommended Refactoring:**

```
TicketsController (Orchestration)
    ├── StoreTicketRequest (Validation)
    ├── UpdateTicketRequest
    ├── AssignTechnicianRequest
    ├── TicketService
    │   ├── createTicket(TicketDTO, attachments)
    │   ├── assignTechnician(ticket, technicianId, supervisorId)
    │   ├── reassignTechnician(ticket, newTechnicianId, supervisorId)
    │   └── changeStatus(ticket, status, userId) ✅ Already exists!
    ├── TicketQueryService
    │   ├── getTicketsForUser(user, filters)
    │   ├── getTicketsForTechnician(technicianId, filters)
    │   ├── getTicketsForSupervisor(filters)
    │   └── getTechnicianWorkloads()
    ├── AttachmentService
    │   ├── storeAttachments(files, ticketId, userId)
    │   └── bulkInsert(attachments)
    ├── TicketRepository
    │   ├── create(data)
    │   ├── findWithRelations(id, relations)
    │   ├── paginateForUser(user, filters)
    │   └── paginateForTechnician(technicianId, filters)
    ├── TicketAcceptanceRepository
    │   └── hasPendingAcceptance(ticketId)
    └── Resources
        ├── TicketResource
        ├── TicketListResource
        └── WorkloadResource
```

**Specific Improvements:**

1. **Split into Multiple Controllers:**
   - `TicketsController` - CRUD operations
   - `TicketAssignmentController` - assignment/reassignment (or keep in TicketsController)
   - `TicketStatusController` - status changes
   - `TechnicianWorkloadController` - workload queries

2. **Create Services:**
   ```php
   class TicketService {
       public function createTicket(CreateTicketDTO $dto, array $files): Ticket
       public function assignTechnician(Ticket $ticket, int $technicianId, int $supervisorId): TicketAcceptance
       public function reassignTechnician(Ticket $ticket, int $newTechId, int $supervisorId): TicketAcceptance
   }
   
   class TicketQueryService {
       public function getTicketsForUser(User $user, TicketFilterDTO $filters): LengthAwarePaginator
       public function getTechnicianWorkloads(): Collection
   }
   
   class AttachmentService {
       public function storeMultiple(array $files, int $ticketId, int $userId): Collection
   }
   ```

3. **Create DTOs:**
   ```php
   class CreateTicketDTO {
       public function __construct(
           public string $title,
           public ?string $description,
           public string $priority,
           public ?int $categoryId,
           public ?int $assignedTechId,
           public int $submitterId,
       ) {}
       
       public static function fromRequest(Request $request): self
   }
   
   class TicketFilterDTO {
       public function __construct(
           public ?string $status = null,
           public ?string $priority = null,
           public ?int $categoryId = null,
       ) {}
   }
   ```

4. **Create Repository:**
   ```php
   class TicketRepository {
       public function create(array $data): Ticket
       public function findWithRelations(int $id, array $relations = []): ?Ticket
       public function paginateForRole(User $user, TicketFilterDTO $filters, int $perPage = 20): LengthAwarePaginator
   }
   ```

5. **Create Policies:**
   - Extend `TicketPolicy` to check:
     - `create` - can user create tickets?
     - `assign` - can user assign technicians?
     - `viewAny` - what tickets can user see?

6. **Use Events:**
   ```php
   // Dispatch instead of inline notification
   event(new TicketCreated($ticket));
   event(new TicketAssignmentRequested($ticket, $technician));
   ```

**Priority:** CRITICAL - Most complex controller, central to app

---

### 3. **UsersController** ⚠️ HIGH PRIORITY

**Current Issues:**
- Direct model access throughout
- Password hashing in controller
- No pagination on index() - performance issue
- Business logic (activate/deactivate) in controller
- Missing bulk operations support
- No proper filtering/search

**Current Code Problems:**
```php
// ❌ Bad: No pagination, direct model access
$users = User::all();

// ❌ Bad: Business logic in controller
$user->is_active = true;
$user->save();
```

**Recommended Refactoring:**

```
UsersController
    ├── StoreUserRequest
    ├── UpdateUserRequest
    ├── UserService
    │   ├── createUser(CreateUserDTO)
    │   ├── updateUser(user, UpdateUserDTO)
    │   ├── activateUser(user)
    │   ├── deactivateUser(user)
    │   └── hashPassword(password)
    ├── UserRepository
    │   ├── findAll(filters, perPage)
    │   ├── findTechnicians()
    │   ├── findById(id)
    │   └── findTechnicianById(id)
    ├── UserPolicy
    │   ├── viewAny()
    │   ├── create()
    │   ├── update(user)
    │   └── changeStatus(user)
    └── Resources
        ├── UserResource
        └── UserListResource
```

**Specific Improvements:**

1. **Add Pagination:**
   ```php
   // Instead of: User::all()
   // Use repository: repository->paginate($filters, $perPage)
   ```

2. **Create UserService:**
   ```php
   class UserService {
       public function createUser(CreateUserDTO $dto): User
       public function updateUser(User $user, UpdateUserDTO $dto): User
       public function activateUser(User $user): User
       public function deactivateUser(User $user): User
   }
   ```

3. **Create UserRepository:**
   ```php
   class UserRepository {
       public function paginate(array $filters = [], int $perPage = 20): LengthAwarePaginator
       public function findTechnicians(bool $activeOnly = true): Collection
       public function findByIdWithRole(int $id, string $role): ?User
   }
   ```

4. **Add Events:**
   - `UserActivated` event
   - `UserDeactivated` event
   - Listeners to log changes or send notifications

**Priority:** HIGH - User management is critical

---

### 4. **CommentsController** ⚠️ MEDIUM-HIGH PRIORITY

**Current Issues:**
- Complex visibility logic scattered in controller
- Notification logic directly in controller
- N+1 query potential (mapping comments)
- Role-based filtering duplicated
- Business rules mixed with HTTP logic

**Current Code Problems:**
```php
// ❌ Bad: Business logic and notifications in controller
if ($userToNotify && $userToNotify->id != $request->user()->id && $comment->is_user_visible) {
    $userToNotify->notify(new CommentAddedToTicket($comment, $ticketId));
}
foreach ($superVisors as $supervisor) {
    if ($supervisor->id != $request->user()->id)
        $supervisor->notify(new CommentAddedToTicket($comment, $ticketId));
}
```

**Recommended Refactoring:**

```
CommentsController
    ├── StoreCommentRequest
    ├── CommentService
    │   ├── addComment(ticket, user, content, isUserVisible)
    │   └── notifyStakeholders(comment, ticket, authorId)
    ├── CommentQueryService
    │   └── getCommentsForUser(ticketId, user)
    ├── CommentRepository
    │   ├── create(data)
    │   ├── findVisibleForUser(ticketId, user)
    │   └── findAllForTicket(ticketId)
    ├── CommentPolicy
    │   ├── view(user, comment)
    │   └── setVisibility(user)
    └── CommentResource
```

**Specific Improvements:**

1. **Create CommentService:**
   ```php
   class CommentService {
       public function addComment(
           Ticket $ticket, 
           User $author, 
           string $content, 
           ?bool $isUserVisible = null
       ): Comment {
           // Determine visibility based on role
           // Create comment
           // Dispatch event (not direct notifications)
           event(new CommentAdded($comment, $ticket));
           return $comment;
       }
   }
   ```

2. **Create CommentQueryService:**
   ```php
   class CommentQueryService {
       public function getCommentsForUser(int $ticketId, User $user): Collection {
           return $this->repository->findVisibleForUser($ticketId, $user);
       }
   }
   ```

3. **Use Events Instead of Direct Notifications:**
   ```php
   // Event
   class CommentAdded {
       public function __construct(
           public Comment $comment,
           public Ticket $ticket,
       ) {}
   }
   
   // Listener
   class NotifyCommentStakeholders {
       public function handle(CommentAdded $event) {
           // All notification logic here
       }
   }
   ```

4. **Create CommentPolicy:**
   ```php
   class CommentPolicy {
       public function view(User $user, Comment $comment): bool {
           if ($user->role === 'supervisor' || $user->role === 'technician') {
               return true;
           }
           return $comment->is_user_visible;
       }
       
       public function setVisibility(User $user): bool {
           return in_array($user->role, ['supervisor', 'technician']);
       }
   }
   ```

**Priority:** MEDIUM-HIGH - Complex notification logic needs cleanup

---

### 5. **NotificationController** ✅ RECENTLY REFACTORED

**Current Status:**
- ✅ Already has `SseAuthResolver` service
- ✅ Already has `NotificationStreamService`
- ✅ Controller is thin and delegates properly

**Minor Improvements:**

1. **Add FormRequest for validation:**
   ```php
   class MarkNotificationAsReadRequest extends FormRequest {
       public function authorize() {
           return $this->user()->notifications()->where('id', $this->id)->exists();
       }
   }
   ```

2. **Consider NotificationService:**
   ```php
   class NotificationService {
       public function markAsRead(User $user, string $notificationId): void
       public function markAllAsRead(User $user): void
       public function getUnreadNotifications(User $user): Collection
   }
   ```

**Priority:** LOW - Recently refactored, mostly good

---

### 6. **CategoriesController** ⚠️ MEDIUM PRIORITY

**Current Issues:**
- Direct model access
- No validation for circular parent references
- Inconsistent error handling (show() vs destroy())
- No pagination
- Missing business rules for category deletion (check if used by tickets)

**Current Code Problems:**
```php
// ❌ Bad: Inconsistent - sometimes uses route model binding, sometimes manual find
public function show($id) {
    $category = Category::find($id);
    if (!$category) { return response()->json(['message' => 'Category not found'], 404); }
}

public function update(Request $request, Category $category) {
    // Uses route model binding
}

// ❌ Bad: No check if category has tickets
public function destroy($category) {
    $category = Category::find($category);
    $category->delete();
}
```

**Recommended Refactoring:**

```
CategoriesController
    ├── StoreCategoryRequest
    ├── UpdateCategoryRequest
    ├── CategoryService
    │   ├── createCategory(CreateCategoryDTO)
    │   ├── updateCategory(category, UpdateCategoryDTO)
    │   ├── deleteCategory(category) // with validation
    │   └── validateParentCategory(parentId, currentId)
    ├── CategoryRepository
    │   ├── findAllWithParent()
    │   ├── findById(id)
    │   ├── hasTickets(categoryId)
    │   └── hasSubcategories(categoryId)
    ├── CategoryPolicy
    │   ├── create()
    │   ├── delete(category)
    │   └── update(category)
    └── CategoryResource
```

**Specific Improvements:**

1. **Consistent Route Model Binding:**
   ```php
   // Use everywhere
   public function show(Category $category)
   public function destroy(Category $category)
   ```

2. **Create CategoryService:**
   ```php
   class CategoryService {
       public function deleteCategory(Category $category): void {
           // Check if category has tickets
           if ($this->repository->hasTickets($category->id)) {
               throw new CategoryInUseException();
           }
           
           // Check if has subcategories
           if ($this->repository->hasSubcategories($category->id)) {
               throw new CategoryHasChildrenException();
           }
           
           $category->delete();
       }
       
       public function validateParentCategory(?int $parentId, int $currentId): void {
           // Prevent circular references
       }
   }
   ```

3. **Add Pagination:**
   ```php
   public function index(Request $request) {
       $categories = $this->repository->paginate($request->get('per_page', 20));
       return CategoryResource::collection($categories);
   }
   ```

**Priority:** MEDIUM - Needs better validation and consistency

---

### 7. **TicketAcceptanceController** ⚠️ HIGH PRIORITY

**Current Issues:**
- Business logic scattered throughout
- Direct model access and queries
- Transaction logic in controller
- Duplicate supervisor fetching logic
- No validation for conflicting states
- Mixed concerns: querying, accepting, rejecting

**Current Code Problems:**
```php
// ❌ Bad: Business logic in controller
$acceptance->is_accepted = 'accepted';
$acceptance->save();
$ticket->assigned_tech_id = $user->id;
$ticket->status = 'in_progress';
$ticket->save();

// ❌ Bad: Notification logic in controller
$superVisors = User::where('role', 'supervisor')->get();
foreach ($superVisors as $supervisor) {
    $supervisor->notify(new TicketAccepted($ticket));
}
```

**Recommended Refactoring:**

```
TicketAcceptanceController
    ├── AcceptTicketRequest
    ├── RejectTicketRequest
    ├── TicketAcceptanceService
    │   ├── acceptAssignment(ticket, technician)
    │   ├── rejectAssignment(ticket, technician, reason?)
    │   └── getPendingAcceptances(technician)
    ├── TicketAcceptanceRepository
    │   ├── findPending(ticketId, technicianId)
    │   ├── findPendingForTechnician(technicianId)
    │   ├── hasPending(ticketId)
    │   └── findLatestAccepted(ticketId)
    ├── Events
    │   ├── TicketAccepted (event)
    │   ├── TicketRejected (event)
    │   └── NotifyAssignmentStakeholders (listener)
    └── Resources
        └── TicketAcceptanceResource
```

**Specific Improvements:**

1. **Create TicketAcceptanceService:**
   ```php
   class TicketAcceptanceService {
       public function acceptAssignment(Ticket $ticket, User $technician): void {
           DB::transaction(function () use ($ticket, $technician) {
               $acceptance = $this->repository->findPending($ticket->id, $technician->id);
               
               if (!$acceptance) {
                   throw new NoPendingAcceptanceException();
               }
               
               // Update acceptance
               $acceptance->update(['is_accepted' => 'accepted']);
               
               // Update ticket
               $ticket->update([
                   'assigned_tech_id' => $technician->id,
                   'status' => 'in_progress',
               ]);
               
               // Log history
               TicketHistoryService::log(...);
               
               // Dispatch event (not direct notifications)
               event(new TicketAccepted($ticket, $technician));
           });
       }
       
       public function rejectAssignment(
           Ticket $ticket, 
           User $technician, 
           ?string $reason = null
       ): void {
           // Similar pattern
       }
   }
   ```

2. **Use Events for Notifications:**
   ```php
   class NotifyAssignmentStakeholders {
       public function handle(TicketAccepted|TicketRejected $event) {
           // Get supervisors once
           $supervisors = User::where('role', 'supervisor')->get();
           
           foreach ($supervisors as $supervisor) {
               $supervisor->notify(new TicketAcceptedNotification($event->ticket));
           }
           
           $event->ticket->submitter->notify(...);
       }
   }
   ```

3. **Clean up isPending() method:**
   ```php
   // This should be in a service/repository, not controller
   class TicketAcceptanceQueryService {
       public function getTicketAcceptanceStatus(int $ticketId): array {
           // Current isPending() logic here
       }
   }
   ```

**Priority:** HIGH - Complex business logic needs proper structure

---

### 8. **SurveyController** ⚠️ MEDIUM PRIORITY

**Current Issues:**
- Mix of service calls and direct queries
- Inconsistent: uses SurveyService for submit, but direct queries elsewhere
- No pagination on getSurveys()
- Business logic leaking (checking is_survey_completed in controller query)

**Current Code Problems:**
```php
// ✅ Good: Uses service
$survey = app(SurveyService::class)->fillSurvey($ticket, $data, auth()->id());

// ❌ Bad: Direct model query with business logic
$surveys = Survey::whereHas('ticket', function ($query) use ($user) {
    $query->where('submitter_id', $user->id)->where('is_survey_completed', false);
})->get();
```

**Recommended Refactoring:**

```
SurveyController
    ├── SubmitSurveyRequest
    ├── SurveyService ✅ (exists)
    │   ├── fillSurvey() ✅
    │   └── getMySurveys(user) // add this
    ├── SurveyQueryService (new)
    │   ├── getAllSurveys(filters, perPage)
    │   ├── getByTicketId(ticketId)
    │   └── getPendingSurveysForUser(user)
    ├── SurveyRepository
    │   ├── findByTicketId(ticketId)
    │   ├── paginateAll(filters, perPage)
    │   └── findPendingForUser(userId)
    └── SurveyResource
```

**Specific Improvements:**

1. **Extend SurveyService:**
   ```php
   class SurveyService {
       // Existing
       public function fillSurvey(...) { }
       
       // Add these
       public function getPendingSurveysForUser(User $user): Collection {
           return $this->repository->findPendingForUser($user->id);
       }
   }
   ```

2. **Create SurveyQueryService:**
   ```php
   class SurveyQueryService {
       public function getAllSurveys(array $filters = [], int $perPage = 20): LengthAwarePaginator {
           return $this->repository->paginateAll($filters, $perPage);
       }
   }
   ```

3. **Add Pagination:**
   ```php
   public function getSurveys(Request $request) {
       $surveys = $this->queryService->getAllSurveys(
           $request->only(['technician_id', 'from', 'to']),
           $request->get('per_page', 20)
       );
       return SurveyResource::collection($surveys);
   }
   ```

**Priority:** MEDIUM - Partially refactored, needs completion

---

### 9. **ReportsController** ⚠️ HIGH PRIORITY

**Current Issues:**
- Complex SQL queries directly in controller
- No caching for expensive aggregations
- Duplicate query building logic
- No service layer - all business logic in controller
- Performance concerns (no query optimization)
- Database-specific SQL (PostgreSQL) - limits portability

**Current Code Problems:**
```php
// ❌ Bad: Complex query logic in controller
$query = Ticket::where('status', 'closed');
if ($from && $to) {
    $query->whereBetween('created_at', [$from, $to]);
}
$averageTime = $query->join('time_tracking', 'tickets.id', '=', 'time_tracking.ticket_id')
    ->avg('time_tracking.total_time_minutes');

// ❌ Bad: PostgreSQL-specific raw SQL
$rows = $query->selectRaw("
    TO_CHAR(DATE_TRUNC('day', time_tracking.created_at), 'YYYY-MM-DD') as date,
    AVG(time_tracking.total_time_minutes) as avg_time
")
```

**Recommended Refactoring:**

```
ReportsController
    ├── ReportService
    │   ├── getAverageResolutionTime(ReportFilterDTO)
    │   ├── getTicketsResolvedCount(ReportFilterDTO)
    │   ├── getCustomerSatisfactionAverage(ReportFilterDTO)
    │   ├── getTicketsResolvedOverTime(ReportFilterDTO)
    │   └── getSolutionTimeTrends(ReportFilterDTO)
    ├── ReportQueryBuilder
    │   ├── buildTicketQuery(filters)
    │   ├── applyDateRange(query, from, to)
    │   ├── applyTechnicianFilter(query, technicianId)
    │   └── applyCategoryFilter(query, categoryId)
    ├── ReportRepository
    │   ├── getAverageResolutionTime(filters)
    │   ├── getResolvedTicketsCount(filters)
    │   ├── getAverageSatisfactionRating(filters)
    │   ├── getResolvedTicketsGroupedByDate(filters)
    │   └── getSolutionTimesByDate(filters)
    ├── ReportCache
    │   └── remember(key, ttl, callback)
    └── Resources
        ├── AverageResolutionTimeResource
        ├── TicketsResolvedResource
        └── ChartDataResource
```

**Specific Improvements:**

1. **Create ReportService:**
   ```php
   class ReportService {
       public function getAverageResolutionTime(ReportFilterDTO $filters): float {
           $cacheKey = "report:avg_resolution:{$filters->hash()}";
           
           return Cache::remember($cacheKey, now()->addMinutes(15), function () use ($filters) {
               return $this->repository->getAverageResolutionTime($filters);
           });
       }
       
       // Similar for other reports
   }
   ```

2. **Create ReportFilterDTO:**
   ```php
   class ReportFilterDTO {
       public function __construct(
           public ?Carbon $from = null,
           public ?Carbon $to = null,
           public ?int $technicianId = null,
           public ?string $priority = null,
           public ?int $categoryId = null,
       ) {}
       
       public static function fromRequest(Request $request): self {
           return new self(
               from: $request->query('from') ? Carbon::parse($request->query('from')) : null,
               to: $request->query('to') ? Carbon::parse($request->query('to')) : null,
               technicianId: $request->query('technician_id'),
               priority: $request->query('priority'),
               categoryId: $request->query('category_id'),
           );
       }
       
       public function hash(): string {
           return md5(serialize($this));
       }
   }
   ```

3. **Create ReportRepository:**
   ```php
   class ReportRepository {
       public function getAverageResolutionTime(ReportFilterDTO $filters): float {
           $query = Ticket::where('status', 'closed')
               ->join('time_tracking', 'tickets.id', '=', 'time_tracking.ticket_id');
           
           $this->applyFilters($query, $filters);
           
           return (float) $query->avg('time_tracking.total_time_minutes') ?? 0.0;
       }
       
       private function applyFilters(Builder $query, ReportFilterDTO $filters): void {
           if ($filters->from && $filters->to) {
               $query->whereBetween('tickets.created_at', [$filters->from, $filters->to]);
           }
           
           if ($filters->technicianId) {
               $query->where('tickets.assigned_tech_id', $filters->technicianId);
           }
           
           // etc...
       }
   }
   ```

4. **Add Caching Strategy:**
   - Cache reports for 15 minutes
   - Invalidate cache when tickets change status
   - Use cache tags for easier invalidation

5. **Consider Using Query Scopes:**
   ```php
   // In Ticket model
   public function scopeClosedBetween($query, $from, $to) {
       return $query->where('status', 'closed')
           ->whereBetween('created_at', [$from, $to]);
   }
   
   public function scopeByTechnician($query, $technicianId) {
       return $query->where('assigned_tech_id', $technicianId);
   }
   ```

**Priority:** HIGH - Performance-critical, needs caching and optimization

---

### 10. **AttachmentController** ✅ GOOD

**Current Status:**
- Simple and focused
- Uses policy correctly (authorize)
- Minimal logic

**Minor Improvements:**

1. **Consider AttachmentService:**
   ```php
   class AttachmentService {
       public function download(Attachment $attachment): BinaryFileResponse {
           if (!Storage::disk('public')->exists($attachment->file_path)) {
               throw new FileNotFoundException();
           }
           return Storage::disk('public')->download(...);
       }
   }
   ```

2. **Add More Authorization:**
   ```php
   class AttachmentPolicy {
       public function view(User $user, Attachment $attachment): bool {
           return $this->ticketPolicy->view($user, $attachment->ticket);
       }
       
       public function delete(User $user, Attachment $attachment): bool {
           // Only uploader or supervisor can delete
       }
   }
   ```

**Priority:** LOW - Already well-structured

---

### 11. **statsController** ⚠️ MEDIUM PRIORITY

**Current Issues:**
- Naming violation: should be `StatsController` (PSR-4)
- Direct model queries
- No caching (performance issue)
- Unused `$user` variable
- Should be merged into ReportsController

**Current Code Problems:**
```php
// ❌ Bad: Unused variable
$user = $request->user();

// ❌ Bad: No caching for counts that change infrequently
$pendingTicketsCount = Ticket::where('status', 'pending')->count();
```

**Recommended Refactoring:**

```
StatsController (rename from statsController)
    ├── StatsService
    │   ├── getPendingTicketsCount()
    │   ├── getOpenTicketsCount()
    │   ├── getClosedTicketsCount()
    │   └── getAllStats() // return all at once
    ├── StatsRepository
    │   └── getCountByStatus(status)
    └── StatsResource
```

**Specific Improvements:**

1. **Rename File:**
   ```bash
   mv statsController.php StatsController.php
   ```

2. **Create StatsService with Caching:**
   ```php
   class StatsService {
       public function getAllStats(): array {
           return Cache::remember('stats:all', now()->addMinutes(5), function () {
               return [
                   'pending' => $this->repository->getCountByStatus('pending'),
                   'open' => $this->repository->getCountByStatus('open'),
                   'closed' => $this->repository->getCountByStatus('closed'),
                   'in_progress' => $this->repository->getCountByStatus('in_progress'),
               ];
           });
       }
   }
   ```

3. **Optimize Controller:**
   ```php
   public function index(Request $request) {
       $stats = $this->statsService->getAllStats();
       return response()->json([
           'success' => true,
           'data' => $stats
       ]);
   }
   ```

4. **Consider Merging:**
   - These stats could be part of ReportsController as `stats()` endpoint

**Priority:** MEDIUM - Simple but needs renaming and optimization

---

### 12. **CategorySuggestionController** ⚠️ LOW-MEDIUM PRIORITY

**Current Issues:**
- Business logic (search) in controller
- Direct model query
- No service layer for reusability
- Magic numbers (limit 10, min length 2)
- Could benefit from search optimization

**Current Code Problems:**
```php
// ❌ Bad: Magic numbers, business logic in controller
if (mb_strlen($searchTerm) < 2) {
    return response()->json(['data' => []]);
}
$categories = Category::where(function ($builder) use ($searchWildcard) {
    // Complex query logic
})->limit(10)->get(['id', 'name']);
```

**Recommended Refactoring:**

```
CategorySuggestionController
    ├── SearchService
    │   └── searchCategories(term, limit)
    ├── CategoryRepository
    │   └── search(term, limit)
    └── CategorySuggestionResource
```

**Specific Improvements:**

1. **Create SearchService:**
   ```php
   class SearchService {
       const MIN_SEARCH_LENGTH = 2;
       const DEFAULT_LIMIT = 10;
       
       public function searchCategories(
           string $term, 
           int $limit = self::DEFAULT_LIMIT
       ): Collection {
           $term = trim($term);
           
           if (mb_strlen($term) < self::MIN_SEARCH_LENGTH) {
               return collect();
           }
           
           return $this->categoryRepository->search($term, $limit);
       }
   }
   ```

2. **Use Repository:**
   ```php
   class CategoryRepository {
       public function search(string $term, int $limit): Collection {
           $searchWildcard = "%{$term}%";
           $prefixWildcard = "{$term}%";
           
           return Category::where(function ($builder) use ($searchWildcard) {
                   $builder->where('name', 'like', $searchWildcard)
                           ->orWhere('description', 'like', $searchWildcard);
               })
               ->orderByRaw("CASE WHEN name LIKE ? THEN 0 ELSE 1 END", [$prefixWildcard])
               ->limit($limit)
               ->get(['id', 'name', 'description']);
       }
   }
   ```

3. **Add Caching:**
   ```php
   public function searchCategories(string $term, int $limit): Collection {
       $cacheKey = "category:search:" . md5($term) . ":{$limit}";
       
       return Cache::remember($cacheKey, now()->addMinutes(30), function () use ($term, $limit) {
           return $this->categoryRepository->search($term, $limit);
       });
   }
   ```

**Priority:** LOW-MEDIUM - Working fine, but could be better

---

## Implementation Priorities

### Phase 1: Critical (Week 1-2)
1. **TicketsController** - Most complex, central to app
2. **TicketAcceptanceController** - Business-critical logic
3. **AuthController** - Security concerns

### Phase 2: High Priority (Week 3-4)
4. **ReportsController** - Performance optimization needed
5. **UsersController** - User management critical
6. **CommentsController** - Notification logic cleanup

### Phase 3: Medium Priority (Week 5-6)
7. **CategoriesController** - Validation improvements
8. **SurveyController** - Complete service extraction
9. **statsController** - Rename and optimize

### Phase 4: Low Priority (Week 7)
10. **CategorySuggestionController** - Minor improvements
11. **AttachmentController** - Already good
12. **NotificationController** - Recently refactored

---

## Code Examples & Best Practices

### 1. Thin Controller Pattern

**❌ Bad (Fat Controller):**
```php
public function store(Request $request)
{
    $data = $request->validate([
        'title' => 'required|string|max:255',
        'email' => 'required|email',
    ]);
    
    $user = DB::transaction(function () use ($data) {
        $user = User::create([
            'title' => $data['title'],
            'email' => $data['email'],
            'password' => Hash::make('password'),
        ]);
        
        $user->sendWelcomeEmail();
        Log::info("User created: {$user->id}");
        
        return $user;
    });
    
    return response()->json(['data' => $user], 201);
}
```

**✅ Good (Thin Controller):**
```php
public function store(StoreUserRequest $request, UserService $service)
{
    $user = $service->createUser(
        CreateUserDTO::fromRequest($request)
    );
    
    return new UserResource($user);
}
```

---

### 2. Service Layer Pattern

**Service Class Example:**
```php
<?php

namespace App\Services;

use App\Models\User;
use App\Repositories\UserRepository;
use App\DTOs\CreateUserDTO;
use App\Events\UserCreated;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function __construct(
        private UserRepository $repository,
    ) {}
    
    public function createUser(CreateUserDTO $dto): User
    {
        return DB::transaction(function () use ($dto) {
            $user = $this->repository->create([
                'username' => $dto->username,
                'email' => $dto->email,
                'password' => Hash::make($dto->password),
                'role' => $dto->role,
                'department' => $dto->department,
            ]);
            
            // Dispatch event instead of direct action
            event(new UserCreated($user));
            
            return $user;
        });
    }
    
    public function updateUser(User $user, UpdateUserDTO $dto): User
    {
        $data = array_filter([
            'username' => $dto->username,
            'email' => $dto->email,
            'role' => $dto->role,
            'department' => $dto->department,
        ], fn($value) => $value !== null);
        
        if ($dto->password) {
            $data['password'] = Hash::make($dto->password);
        }
        
        $user->update($data);
        
        return $user->fresh();
    }
    
    public function activateUser(User $user): User
    {
        $user->update(['is_active' => true]);
        event(new UserActivated($user));
        return $user;
    }
    
    public function deactivateUser(User $user): User
    {
        $user->update(['is_active' => false]);
        event(new UserDeactivated($user));
        return $user;
    }
}
```

---

### 3. Repository Pattern

**Repository Example:**
```php
<?php

namespace App\Repositories;

use App\Models\Ticket;
use App\DTOs\TicketFilterDTO;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class TicketRepository
{
    public function create(array $data): Ticket
    {
        return Ticket::create($data);
    }
    
    public function findById(int $id, array $with = []): ?Ticket
    {
        return Ticket::with($with)->find($id);
    }
    
    public function paginateForUser(
        User $user, 
        TicketFilterDTO $filters, 
        int $perPage = 20
    ): LengthAwarePaginator {
        $query = Ticket::with(['category', 'attachments']);
        
        // Role-based filtering
        match ($user->role) {
            'user' => $query->where('submitter_id', $user->id),
            'technician' => $query->where('assigned_tech_id', $user->id),
            'supervisor' => $query, // see all
            default => $query->whereRaw('1 = 0'), // no access
        };
        
        // Apply filters
        $this->applyFilters($query, $filters);
        
        return $query->orderBy('created_at', 'desc')->paginate($perPage);
    }
    
    private function applyFilters($query, TicketFilterDTO $filters): void
    {
        if ($filters->status) {
            $query->where('status', $filters->status);
        }
        
        if ($filters->priority) {
            $query->where('priority', $filters->priority);
        }
        
        if ($filters->categoryId) {
            $query->where('category_id', $filters->categoryId);
        }
    }
    
    public function getTechnicianWorkloads(): Collection
    {
        return Ticket::selectRaw("
                assigned_tech_id,
                COUNT(*) as ticket_count,
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count
            ")
            ->whereNotNull('assigned_tech_id')
            ->groupBy('assigned_tech_id')
            ->with('technician:id,username,email')
            ->get();
    }
}
```

---

### 4. Data Transfer Objects (DTOs)

**DTO Example:**
```php
<?php

namespace App\DTOs;

use Illuminate\Http\Request;

class CreateTicketDTO
{
    public function __construct(
        public readonly string $title,
        public readonly ?string $description,
        public readonly string $priority,
        public readonly ?int $categoryId,
        public readonly ?int $assignedTechId,
        public readonly int $submitterId,
    ) {}
    
    public static function fromRequest(Request $request): self
    {
        return new self(
            title: $request->input('title'),
            description: $request->input('description'),
            priority: $request->input('priority'),
            categoryId: $request->input('category_id'),
            assignedTechId: $request->input('assigned_tech_id'),
            submitterId: $request->user()->id,
        );
    }
    
    public function toArray(): array
    {
        return [
            'title' => $this->title,
            'description' => $this->description,
            'priority' => $this->priority,
            'category_id' => $this->categoryId,
            'assigned_tech_id' => $this->assignedTechId,
            'submitter_id' => $this->submitterId,
        ];
    }
}
```

---

### 5. Form Request Classes

**FormRequest Example:**
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTicketRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Check if user can create tickets
        return $this->user()->can('create', Ticket::class);
    }
    
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:5000'],
            'priority' => ['required', 'string', 'in:low,medium,high,critical'],
            'assigned_tech_id' => ['nullable', 'integer', 'exists:users,id'],
            'category_id' => ['nullable', 'integer', 'exists:categories,id'],
            'attachments' => ['array', 'max:5'],
            'attachments.*' => ['file', 'max:10240', 'mimes:pdf,jpg,png,doc,docx'],
        ];
    }
    
    public function messages(): array
    {
        return [
            'title.required' => 'Please provide a ticket title.',
            'priority.in' => 'Priority must be one of: low, medium, high, critical.',
            'attachments.*.max' => 'Each attachment must be less than 10MB.',
        ];
    }
    
    protected function prepareForValidation(): void
    {
        // Clean/transform data before validation
        $this->merge([
            'title' => trim($this->title ?? ''),
        ]);
    }
}
```

---

### 6. API Resources

**Resource Example:**
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TicketResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
            
            // Relationships
            'category' => new CategoryResource($this->whenLoaded('category')),
            'technician' => new UserResource($this->whenLoaded('technician')),
            'attachments' => AttachmentResource::collection($this->whenLoaded('attachments')),
            
            // Computed values
            'is_overdue' => $this->isOverdue(),
            'days_open' => $this->daysOpen(),
            
            // Conditional fields based on user role
            'internal_notes' => $this->when(
                $request->user()->role === 'supervisor',
                $this->internal_notes
            ),
        ];
    }
}
```

---

### 7. Events & Listeners

**Event Example:**
```php
<?php

namespace App\Events;

use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TicketAssigned
{
    use Dispatchable, SerializesModels;
    
    public function __construct(
        public Ticket $ticket,
        public User $technician,
        public User $assignedBy,
    ) {}
}
```

**Listener Example:**
```php
<?php

namespace App\Listeners;

use App\Events\TicketAssigned;
use App\Models\User;
use App\Notifications\TicketAssignedNotification;
use Illuminate\Support\Facades\Log;

class NotifyTicketAssignmentStakeholders
{
    public function handle(TicketAssigned $event): void
    {
        // Notify technician
        $event->technician->notify(
            new TicketAssignedNotification($event->ticket)
        );
        
        // Notify supervisors
        User::where('role', 'supervisor')
            ->each(fn($supervisor) => 
                $supervisor->notify(new TicketAssignedNotification($event->ticket))
            );
        
        // Log for audit
        Log::info('Ticket assigned', [
            'ticket_id' => $event->ticket->id,
            'technician_id' => $event->technician->id,
            'assigned_by' => $event->assignedBy->id,
        ]);
    }
}
```

**Register in EventServiceProvider:**
```php
protected $listen = [
    TicketAssigned::class => [
        NotifyTicketAssignmentStakeholders::class,
        UpdateTicketHistory::class,
    ],
];
```

---

### 8. Policy Pattern

**Policy Example:**
```php
<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Ticket;

class TicketPolicy
{
    public function viewAny(User $user): bool
    {
        return true; // All authenticated users can view tickets
    }
    
    public function view(User $user, Ticket $ticket): bool
    {
        return match ($user->role) {
            'supervisor' => true,
            'technician' => $ticket->assigned_tech_id === $user->id,
            'user' => $ticket->submitter_id === $user->id,
            default => false,
        };
    }
    
    public function create(User $user): bool
    {
        return in_array($user->role, ['user', 'supervisor']);
    }
    
    public function update(User $user, Ticket $ticket): bool
    {
        if ($user->role === 'supervisor') {
            return true;
        }
        
        if ($user->role === 'technician') {
            return $ticket->assigned_tech_id === $user->id;
        }
        
        return false;
    }
    
    public function delete(User $user, Ticket $ticket): bool
    {
        return $user->role === 'supervisor';
    }
    
    public function assign(User $user, Ticket $ticket): bool
    {
        return $user->role === 'supervisor';
    }
    
    public function changeStatus(User $user, Ticket $ticket): bool
    {
        return $user->role === 'supervisor' 
            || ($user->role === 'technician' && $ticket->assigned_tech_id === $user->id);
    }
}
```

**Usage in Controller:**
```php
public function update(UpdateTicketRequest $request, Ticket $ticket)
{
    $this->authorize('update', $ticket);
    
    // ... rest of logic
}
```

---

### 9. Query Scopes

**Model with Scopes:**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Builder;

class Ticket extends Model
{
    // Local Scopes
    public function scopeOpen(Builder $query): Builder
    {
        return $query->where('status', 'open');
    }
    
    public function scopeClosed(Builder $query): Builder
    {
        return $query->where('status', 'closed');
    }
    
    public function scopeByPriority(Builder $query, string $priority): Builder
    {
        return $query->where('priority', $priority);
    }
    
    public function scopeForUser(Builder $query, User $user): Builder
    {
        return match ($user->role) {
            'user' => $query->where('submitter_id', $user->id),
            'technician' => $query->where('assigned_tech_id', $user->id),
            'supervisor' => $query,
            default => $query->whereRaw('1 = 0'),
        };
    }
    
    public function scopeOverdue(Builder $query): Builder
    {
        return $query->where('status', '!=', 'closed')
            ->whereRaw('DATEDIFF(NOW(), created_at) > 7');
    }
    
    // Usage:
    // Ticket::open()->byPriority('high')->get();
    // Ticket::forUser($user)->overdue()->paginate(20);
}
```

---

### 10. Caching Strategy

**Service with Caching:**
```php
<?php

namespace App\Services;

use App\Repositories\StatsRepository;
use Illuminate\Support\Facades\Cache;

class StatsService
{
    private const CACHE_TTL = 300; // 5 minutes
    private const CACHE_PREFIX = 'stats:';
    
    public function __construct(
        private StatsRepository $repository
    ) {}
    
    public function getTicketStats(): array
    {
        return Cache::remember(
            self::CACHE_PREFIX . 'tickets',
            self::CACHE_TTL,
            fn() => $this->repository->getTicketStatistics()
        );
    }
    
    public function getUserStats(int $userId): array
    {
        return Cache::remember(
            self::CACHE_PREFIX . "user:{$userId}",
            self::CACHE_TTL,
            fn() => $this->repository->getUserStatistics($userId)
        );
    }
    
    public function invalidateAllStats(): void
    {
        Cache::tags(['stats'])->flush();
    }
    
    public function invalidateUserStats(int $userId): void
    {
        Cache::forget(self::CACHE_PREFIX . "user:{$userId}");
    }
}

// In event listener:
class InvalidateStatsCache
{
    public function handle(TicketStatusChanged $event): void
    {
        app(StatsService::class)->invalidateAllStats();
    }
}
```

---

## Directory Structure After Refactoring

```
app/
├── Http/
│   ├── Controllers/
│   │   ├── AttachmentController.php ✅
│   │   ├── AuthController.php
│   │   ├── CategoriesController.php
│   │   ├── CategorySuggestionController.php
│   │   ├── CommentsController.php
│   │   ├── NotificationController.php ✅
│   │   ├── ReportsController.php
│   │   ├── StatsController.php (renamed)
│   │   ├── SurveyController.php
│   │   ├── TicketAcceptanceController.php
│   │   ├── TicketsController.php
│   │   └── UsersController.php
│   ├── Requests/
│   │   ├── Auth/
│   │   │   ├── LoginRequest.php
│   │   │   └── LogoutRequest.php
│   │   ├── Tickets/
│   │   │   ├── StoreTicketRequest.php
│   │   │   ├── UpdateTicketRequest.php
│   │   │   ├── AssignTechnicianRequest.php
│   │   │   └── UpdateStatusRequest.php
│   │   ├── Users/
│   │   │   ├── StoreUserRequest.php
│   │   │   └── UpdateUserRequest.php
│   │   ├── Categories/
│   │   │   ├── StoreCategoryRequest.php
│   │   │   └── UpdateCategoryRequest.php
│   │   ├── Comments/
│   │   │   └── StoreCommentRequest.php
│   │   └── Surveys/
│   │       └── SubmitSurveyRequest.php
│   ├── Resources/
│   │   ├── AttachmentResource.php
│   │   ├── CategoryResource.php
│   │   ├── CommentResource.php
│   │   ├── NotificationResource.php
│   │   ├── TicketResource.php
│   │   ├── TicketListResource.php
│   │   ├── UserResource.php
│   │   └── SurveyResource.php
│   └── Middleware/
├── Services/
│   ├── Auth/
│   │   ├── AuthService.php
│   │   └── SseAuthResolver.php ✅
│   ├── Tickets/
│   │   ├── TicketService.php ✅
│   │   ├── TicketQueryService.php
│   │   ├── TicketAcceptanceService.php
│   │   └── AttachmentService.php
│   ├── Users/
│   │   └── UserService.php
│   ├── Categories/
│   │   ├── CategoryService.php
│   │   └── SearchService.php
│   ├── Comments/
│   │   ├── CommentService.php
│   │   └── CommentQueryService.php
│   ├── Reports/
│   │   ├── ReportService.php
│   │   └── StatsService.php
│   ├── Surveys/
│   │   ├── SurveyService.php ✅
│   │   └── SurveyQueryService.php
│   ├── History/
│   │   └── TicketHistoryService.php ✅
│   ├── TimeTracking/
│   │   └── TimeTrackingService.php ✅
│   └── Notifications/
│       └── NotificationStreamService.php ✅
├── Repositories/
│   ├── TicketRepository.php
│   ├── UserRepository.php
│   ├── CategoryRepository.php
│   ├── CommentRepository.php
│   ├── SurveyRepository.php
│   ├── TicketAcceptanceRepository.php
│   ├── AttachmentRepository.php
│   └── ReportRepository.php
├── DTOs/
│   ├── Tickets/
│   │   ├── CreateTicketDTO.php
│   │   ├── UpdateTicketDTO.php
│   │   └── TicketFilterDTO.php
│   ├── Users/
│   │   ├── CreateUserDTO.php
│   │   └── UpdateUserDTO.php
│   ├── Categories/
│   │   ├── CreateCategoryDTO.php
│   │   └── UpdateCategoryDTO.php
│   └── Reports/
│       └── ReportFilterDTO.php
├── Policies/
│   ├── AttachmentPolicy.php
│   ├── CategoryPolicy.php
│   ├── CommentPolicy.php
│   ├── TicketPolicy.php ✅
│   ├── UserPolicy.php
│   └── SurveyPolicy.php
├── Events/
│   ├── Tickets/
│   │   ├── TicketCreated.php
│   │   ├── TicketAssigned.php
│   │   ├── TicketStatusChanged.php
│   │   └── TicketAccepted.php
│   ├── Users/
│   │   ├── UserActivated.php
│   │   └── UserDeactivated.php
│   └── Comments/
│       └── CommentAdded.php
├── Listeners/
│   ├── NotifyTicketStakeholders.php
│   ├── NotifyAssignmentStakeholders.php
│   ├── NotifyCommentStakeholders.php
│   ├── UpdateTicketHistory.php
│   ├── InvalidateStatsCache.php
│   └── SendWelcomeEmail.php
└── Exceptions/
    ├── TicketExceptions/
    │   ├── TicketNotFoundException.php
    │   ├── InvalidStatusTransitionException.php
    │   └── AssignmentConflictException.php
    ├── UserExceptions/
    │   └── UserInactiveException.php
    └── CategoryExceptions/
        ├── CategoryInUseException.php
        └── CategoryHasChildrenException.php
```

---

## Summary of Benefits

### Before (Current State):
- ❌ Business logic in controllers (hard to test)
- ❌ Direct model access (tight coupling)
- ❌ Duplicate code across controllers
- ❌ No separation of concerns
- ❌ Difficult to maintain
- ❌ Hard to test in isolation
- ❌ No caching strategy
- ❌ Performance issues

### After (Layered Architecture):
- ✅ Thin controllers (easy orchestration)
- ✅ Testable business logic (services)
- ✅ Reusable repositories
- ✅ Clear separation of concerns
- ✅ DRY principle (no duplication)
- ✅ Easy to test (unit + integration)
- ✅ Cacheable queries
- ✅ Better performance
- ✅ Scalable architecture
- ✅ Domain-driven design
- ✅ SOLID principles

---

## Testing Strategy

### Unit Tests (Services & Repositories)
```php
class TicketServiceTest extends TestCase
{
    public function test_can_create_ticket_with_valid_data()
    {
        $dto = new CreateTicketDTO(
            title: 'Test Ticket',
            description: 'Test Description',
            priority: 'high',
            categoryId: 1,
            assignedTechId: null,
            submitterId: 1,
        );
        
        $ticket = $this->ticketService->createTicket($dto, []);
        
        $this->assertDatabaseHas('tickets', [
            'title' => 'Test Ticket',
            'submitter_id' => 1,
        ]);
    }
}
```

### Integration Tests (Controllers)
```php
class TicketsControllerTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_user_can_create_ticket()
    {
        $user = User::factory()->create(['role' => 'user']);
        
        $response = $this->actingAs($user)
            ->postJson('/api/tickets', [
                'title' => 'Test Ticket',
                'priority' => 'high',
            ]);
        
        $response->assertStatus(201)
            ->assertJsonStructure(['data' => ['id', 'title']]);
    }
}
```

---

## Migration Path

1. **Start with New Features**: Build new features using layered architecture
2. **Refactor Critical Paths**: Start with most-used controllers (TicketsController)
3. **One Controller at a Time**: Don't refactor everything at once
4. **Write Tests First**: Ensure existing behavior is preserved
5. **Deploy Incrementally**: Deploy each refactored controller separately
6. **Monitor Performance**: Track improvements in response times

---

**Document Version:** 1.0  
**Last Updated:** January 27, 2026  
**Author:** GitHub Copilot  
**Status:** Ready for Implementation
