// تخزين البيانات
let customers = JSON.parse(localStorage.getItem('customers')) || [];
let employees = JSON.parse(localStorage.getItem('employees')) || [];
let currentEditType = '';
let currentEditId = '';

// تهيئة التطبيق
document.addEventListener('DOMContentLoaded', function() {
    loadCustomers();
    loadEmployees();
    setupEventListeners();
});

// إضافة مستمعي الأحداث
function setupEventListeners() {
    // تبويبات
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });

    // البحث
    document.getElementById('customerSearch').addEventListener('keyup', function() {
        filterTable('customers', this.value);
    });

    document.getElementById('employeeSearch').addEventListener('keyup', function() {
        filterTable('employees', this.value);
    });
}

// تبديل التبويبات
function switchTab(tabName) {
    // إخفاء جميع التبوي��ات
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });

    // إزالة الفئة النشطة من جميع الأزرار
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // عرض التبويب المختار
    document.getElementById(tabName).classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// إظهار/إخفاء النموذج
function toggleForm(formId) {
    const form = document.getElementById(formId);
    form.classList.toggle('hidden');
    
    // مسح النموذج
    if (!form.classList.contains('hidden')) {
        form.querySelectorAll('input').forEach(input => {
            input.value = '';
            input.classList.remove('error');
        });
    }
}

// إضافة عميل جديد
function addCustomer() {
    const name = document.getElementById('customerName').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const address = document.getElementById('customerAddress').value.trim();

    // التحقق من البيانات
    if (!validateEmail(email)) {
        showError('البريد الإلكتروني غير صحيح');
        document.getElementById('customerEmail').classList.add('error');
        return;
    }

    if (!validatePhone(phone)) {
        showError('رقم الهاتف غير صحيح');
        document.getElementById('customerPhone').classList.add('error');
        return;
    }

    if (!name || !email || !phone || !address) {
        showError('الرجاء ملء جميع الحقول');
        return;
    }

    // التحقق من عدم تكرار البريد الإلكتروني
    if (customers.some(c => c.email === email)) {
        showError('هذا البريد الإلكتروني موجود بالفعل');
        return;
    }

    const customer = {
        id: Date.now(),
        name,
        email,
        phone,
        address
    };

    customers.push(customer);
    saveToLocalStorage('customers', customers);
    loadCustomers();
    toggleForm('customerForm');
    showSuccess('تم إضافة العميل بنجاح');
}

// إضافة موظف جديد
function addEmployee() {
    const name = document.getElementById('employeeName').value.trim();
    const email = document.getElementById('employeeEmail').value.trim();
    const position = document.getElementById('employeePosition').value.trim();
    const salary = document.getElementById('employeeSalary').value.trim();

    // التحقق من البيانات
    if (!validateEmail(email)) {
        showError('البريد الإلكتروني غير صحيح');
        document.getElementById('employeeEmail').classList.add('error');
        return;
    }

    if (!salary || isNaN(salary) || salary <= 0) {
        showError('الراتب يجب أن يكون رقماً موجباً');
        document.getElementById('employeeSalary').classList.add('error');
        return;
    }

    if (!name || !email || !position || !salary) {
        showError('الرجاء ملء جميع الحقول');
        return;
    }

    // التحقق من عدم تكرار البريد الإلكتروني
    if (employees.some(e => e.email === email)) {
        showError('هذا البريد الإلكتروني موجود بالفعل');
        return;
    }

    const employee = {
        id: Date.now(),
        name,
        email,
        position,
        salary: parseFloat(salary)
    };

    employees.push(employee);
    saveToLocalStorage('employees', employees);
    loadEmployees();
    toggleForm('employeeForm');
    showSuccess('تم إضافة الموظف بنجاح');
}

// تحميل وعرض العملاء
function loadCustomers() {
    const tbody = document.getElementById('customersBody');
    
    if (customers.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">لا توجد بيانات عملاء</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map((customer, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${customer.name}</td>
            <td>${customer.email}</td>
            <td>${customer.phone}</td>
            <td>${customer.address}</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-edit" onclick="editCustomer(${customer.id})">✏️ تعديل</button>
                    <button class="btn btn-danger" onclick="deleteCustomer(${customer.id})">🗑️ حذف</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// تحميل وعرض الموظفين
function loadEmployees() {
    const tbody = document.getElementById('employeesBody');
    
    if (employees.length === 0) {
        tbody.innerHTML = '<tr class="empty-row"><td colspan="6">لا توجد بيانات موظفين</td></tr>';
        return;
    }

    tbody.innerHTML = employees.map((employee, index) => `
        <tr>
            <td>${index + 1}</td>
            <td>${employee.name}</td>
            <td>${employee.email}</td>
            <td>${employee.position}</td>
            <td>${parseFloat(employee.salary).toLocaleString('ar-SA')} ريال</td>
            <td>
                <div class="table-actions">
                    <button class="btn btn-edit" onclick="editEmployee(${employee.id})">✏️ تعديل</button>
                    <button class="btn btn-danger" onclick="deleteEmployee(${employee.id})">🗑️ حذف</button>
                </div>
            </td>
        </tr>
    `).join('');
}

// تعديل عميل
function editCustomer(id) {
    const customer = customers.find(c => c.id === id);
    if (!customer) return;

    currentEditType = 'customer';
    currentEditId = id;

    const editFields = document.getElementById('editFields');
    editFields.innerHTML = `
        <div class="form-group">
            <label for="editName">الاسم</label>
            <input type="text" id="editName" value="${customer.name}">
        </div>
        <div class="form-group">
            <label for="editEmail">البريد الإلكتروني</label>
            <input type="email" id="editEmail" value="${customer.email}">
        </div>
        <div class="form-group">
            <label for="editPhone">رقم الهاتف</label>
            <input type="tel" id="editPhone" value="${customer.phone}">
        </div>
        <div class="form-group">
            <label for="editAddress">العنوان</label>
            <input type="text" id="editAddress" value="${customer.address}">
        </div>
    `;

    document.getElementById('modalTitle').textContent = 'تعديل بيانات العميل';
    openModal();
}

// تعديل موظف
function editEmployee(id) {
    const employee = employees.find(e => e.id === id);
    if (!employee) return;

    currentEditType = 'employee';
    currentEditId = id;

    const editFields = document.getElementById('editFields');
    editFields.innerHTML = `
        <div class="form-group">
            <label for="editName">الاسم</label>
            <input type="text" id="editName" value="${employee.name}">
        </div>
        <div class="form-group">
            <label for="editEmail">البريد الإلكتروني</label>
            <input type="email" id="editEmail" value="${employee.email}">
        </div>
        <div class="form-group">
            <label for="editPosition">الموضع الوظيفي</label>
            <input type="text" id="editPosition" value="${employee.position}">
        </div>
        <div class="form-group">
            <label for="editSalary">الراتب</label>
            <input type="number" id="editSalary" value="${employee.salary}">
        </div>
    `;

    document.getElementById('modalTitle').textContent = 'تعديل بيانات الموظف';
    openModal();
}

// حفظ التعديلات
function saveEdit() {
    if (currentEditType === 'customer') {
        const name = document.getElementById('editName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const phone = document.getElementById('editPhone').value.trim();
        const address = document.getElementById('editAddress').value.trim();

        if (!validateEmail(email)) {
            showError('البريد الإلكتروني غير صحيح');
            return;
        }

        if (!validatePhone(phone)) {
            showError('رقم الهاتف غير صحيح');
            return;
        }

        const customer = customers.find(c => c.id === currentEditId);
        customer.name = name;
        customer.email = email;
        customer.phone = phone;
        customer.address = address;
    } else if (currentEditType === 'employee') {
        const name = document.getElementById('editName').value.trim();
        const email = document.getElementById('editEmail').value.trim();
        const position = document.getElementById('editPosition').value.trim();
        const salary = document.getElementById('editSalary').value.trim();

        if (!validateEmail(email)) {
            showError('البريد الإلكتروني غير صحيح');
            return;
        }

        if (!salary || isNaN(salary) || salary <= 0) {
            showError('الراتب يجب أن يكون رقماً موجباً');
            return;
        }

        const employee = employees.find(e => e.id === currentEditId);
        employee.name = name;
        employee.email = email;
        employee.position = position;
        employee.salary = parseFloat(salary);
    }

    saveToLocalStorage(currentEditType === 'customer' ? 'customers' : 'employees', 
                       currentEditType === 'customer' ? customers : employees);
    closeModal();
    currentEditType === 'customer' ? loadCustomers() : loadEmployees();
    showSuccess('تم حفظ التعديلات بنجاح');
}

// حذف عميل
function deleteCustomer(id) {
    if (confirm('هل أنت متأكد من حذف هذا العميل؟')) {
        customers = customers.filter(c => c.id !== id);
        saveToLocalStorage('customers', customers);
        loadCustomers();
        showSuccess('تم حذف العميل بنجاح');
    }
}

// حذف موظف
function deleteEmployee(id) {
    if (confirm('هل أنت متأكد من حذف هذا الموظف؟')) {
        employees = employees.filter(e => e.id !== id);
        saveToLocalStorage('employees', employees);
        loadEmployees();
        showSuccess('تم حذف الموظف بنجاح');
    }
}

// البحث والتصفية
function filterTable(type, searchTerm) {
    const data = type === 'customers' ? customers : employees;
    const tbody = type === 'customers' ? document.getElementById('customersBody') : document.getElementById('employeesBody');
    
    const filtered = data.filter(item => {
        const searchText = searchTerm.toLowerCase();
        return Object.values(item).some(val => 
            String(val).toLowerCase().includes(searchText)
        );
    });

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr class="empty-row"><td colspan="6">لا توجد نتائج بحث</td></tr>`;
        return;
    }

    if (type === 'customers') {
        tbody.innerHTML = filtered.map((customer, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${customer.name}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>
                <td>${customer.address}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-edit" onclick="editCustomer(${customer.id})">✏️ تعديل</button>
                        <button class="btn btn-danger" onclick="deleteCustomer(${customer.id})">🗑️ حذف</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } else {
        tbody.innerHTML = filtered.map((employee, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td>${employee.position}</td>
                <td>${parseFloat(employee.salary).toLocaleString('ar-SA')} ريال</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-edit" onclick="editEmployee(${employee.id})">✏️ تعديل</button>
                        <button class="btn btn-danger" onclick="deleteEmployee(${employee.id})">🗑️ حذف</button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// تصدير إلى CSV
function exportToCSV(type) {
    const data = type === 'customers' ? customers : employees;
    
    if (data.length === 0) {
        showError('لا توجد بيانات للتصدير');
        return;
    }

    let csv = '';
    
    if (type === 'customers') {
        csv = 'الاسم,البريد الإلكتروني,رقم الهاتف,العنوان\n';
        csv += data.map(c => 
            `"${c.name}","${c.email}","${c.phone}","${c.address}"`
        ).join('\n');
    } else {
        csv = 'الاسم,البريد الإلكتروني,الموضع الوظيفي,الراتب\n';
        csv += data.map(e => 
            `"${e.name}","${e.email}","${e.position}","${e.salary}"`
        ).join('\n');
    }

    downloadCSV(csv, type === 'customers' ? 'عملاء' : 'موظفين');
}

// تنزيل ملف CSV
function downloadCSV(csv, filename) {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toLocaleDateString('ar-SA')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// حفظ في LocalStorage
function saveToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// التحقق من البريد الإلكتروني
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// التحقق من رقم الهاتف
function validatePhone(phone) {
    const phoneRegex = /^[0-9\s\-\+\(\)]{7,}$/;
    return phoneRegex.test(phone);
}

// فتح Modal
function openModal() {
    document.getElementById('editModal').classList.remove('hidden');
}

// إغلاق Modal
function closeModal() {
    document.getElementById('editModal').classList.add('hidden');
}

// عرض رسالة نجاح
function showSuccess(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'success-message';
    msgDiv.textContent = message;
    document.body.insertBefore(msgDiv, document.body.firstChild);
    
    setTimeout(() => {
        msgDiv.remove();
    }, 3000);
}

// عرض رسالة خطأ
function showError(message) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'success-message';
    msgDiv.style.background = '#f44336';
    msgDiv.textContent = '❌ ' + message;
    document.body.insertBefore(msgDiv, document.body.firstChild);
    
    setTimeout(() => {
        msgDiv.remove();
    }, 3000);
}

// إغلاق Modal عند الضغط على X
document.addEventListener('click', function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeModal();
    }
});