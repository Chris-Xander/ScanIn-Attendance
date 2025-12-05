import React from 'react';
import './AdminDashboard.css';

function AdminDashboard() {
    return (
        <div className='dashboard-display-container'>
            <h2>Admin Dashboard</h2>
            <p>Welcome to the admin panel. </p>

            {/* Dashboard Stats */}
            <div className="dashboard-content">
                <div className="dashboard-stat">
                    <h3>Active QR Codes</h3>
                    <p>0</p>
                </div>
                <div className="dashboard-stat">
                    <h3>Today's Scans</h3>
                    <p>0</p>
                </div>
                <div className="dashboard-stat">
                    <h3>Total Reports</h3>
                    <p>0</p>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
