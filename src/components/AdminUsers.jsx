import React from 'react';
import './AdminUsers.css';

function AdminUsers() {
    return (
        <div>
            <h2>User Control</h2>
            <p>User management section.</p>

            {/* User Stats */}
            <div className="user-stats-row">
                <div className="user-stat-card">
                    <h3>Total Users</h3>
                    <p>0</p>
                </div>
                <div className="user-stat-card">
                    <h3>Active Users</h3>
                    <p>0</p>
                </div>

            </div>

            {/* User Management Form */}
            <div className="admin-db-form-container">
                <div className="admin-db-form">
                    <h3>Add New User</h3>
                    <label htmlFor="userName">User Name:</label>
                    <input
                        type="text"
                        id="userName"
                        placeholder="Enter user name"
                    />

                    <label htmlFor="userEmail">Email:</label>
                    <input
                        type="email"
                        id="userEmail"
                        placeholder="Enter email address"
                    />

                    <label htmlFor="userRole">Role:</label>
                    <select id="userRole">
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>

                    <div className="admin-db-btns">
                        <button className="admin-db-open-btn">
                            Add User
                        </button>
                        <button className="admin-db-delete-btn">
                            Clear Form
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminUsers;
