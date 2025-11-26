import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from 'firebase/firestore';
import QRCode from 'react-qr-code';
import './AdminQRCodes.css';

const AdminQRCodes = () => {
	const { currentUser } = useAuth();
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [qrCodes, setQrCodes] = useState([]);
	const [loading, setLoading] = useState(false);
	const [showQRModal, setShowQRModal] = useState(false);
	const [selectedQR, setSelectedQR] = useState(null);
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		location: '',
		eventType: '',
		validFrom: '',
		validUntil: '',
		requiresForm: false,
		formFields: [],
		isActive: true
	});
	const [newField, setNewField] = useState('');

	useEffect(() => {
		console.log('Current user:', currentUser);
		fetchQRCodes();
	}, [currentUser]);

	const fetchQRCodes = async () => {
		try {
			if (!currentUser) {
				console.log('No current user; skipping fetch.');
				setQrCodes([]);
				return;
			}
			console.log('Fetching QR codes for adminId:', currentUser.uid);
			const qrCodesRef = collection(db, 'customQRCodes');
			const qrQuery = query(qrCodesRef, where('adminId', '==', currentUser.uid));
			const snapshot = await getDocs(qrQuery);
			const codes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
			setQrCodes(codes);
			console.log(`Fetched ${codes.length} QR codes.`);
		} catch (error) {
			console.error('Error fetching QR codes:', error);
		}
	};

	const handleFormChange = (e) => {
		const { name, value, type, checked } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value
		}));
	};

	const addField = () => {
		const trimmed = newField.trim();
		if (trimmed && !formData.formFields.includes(trimmed)) {
			setFormData(prev => ({
				...prev,
				formFields: [...prev.formFields, trimmed]
			}));
		}
		setNewField('');
	};

	const removeField = (field) => {
		setFormData(prev => ({
			...prev,
			formFields: prev.formFields.filter(f => f !== field)
		}));
	};

	const generateQRId = () => {
		return `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const qrId = generateQRId();
			const qrData = {
				...formData,
				qrId,
				adminId: currentUser.uid,
				createdAt: new Date().toISOString(),
				scanCount: 0
			};

			// Create QR code in customQRCodes collection
			const qrDocRef = await addDoc(collection(db, 'customQRCodes'), qrData);

			// Create corresponding QR-Gate report item in qrGateReports collection
			const gateReportData = {
				qrCodeId: qrId,
				qrCodeDocId: qrDocRef.id,
				name: formData.name,
				description: formData.description,
				location: formData.location,
				eventType: formData.eventType,
				validFrom: formData.validFrom,
				validUntil: formData.validUntil,
				requiresForm: formData.requiresForm,
				formFields: formData.formFields,
				isActive: formData.isActive,
				adminId: currentUser.uid,
				createdAt: new Date().toISOString(),
				scanCount: 0,
				totalScans: 0,
				lastScanAt: null
			};

			await addDoc(collection(db, 'qrGateReports'), gateReportData);

			// Reset form
			setFormData({
				name: '',
				description: '',
				location: '',
				eventType: '',
				validFrom: '',
				validUntil: '',
				requiresForm: false,
				formFields: [],
				isActive: true
			});
			setNewField('');
			setShowCreateForm(false);
			fetchQRCodes();
		} catch (error) {
			console.error('Error creating QR code:', error);
			alert('Failed to create QR code. Please try again.');
		} finally {
			setLoading(false);
		}
	};

	const toggleActive = async (qrCodeId, currentStatus) => {
		try {
			await updateDoc(doc(db, 'customQRCodes', qrCodeId), {
				isActive: !currentStatus
			});
			fetchQRCodes();
		} catch (error) {
			console.error('Error updating QR code:', error);
		}
	};

	const deleteQRCode = async (qrCodeId) => {
		if (window.confirm('Are you sure you want to delete this QR code?')) {
			try {
				await deleteDoc(doc(db, 'customQRCodes', qrCodeId));
				fetchQRCodes();
			} catch (error) {
				console.error('Error deleting QR code:', error);
			}
		}
	};

	const viewQRCode = (qr) => {
		setSelectedQR(qr);
		setShowQRModal(true);
	};

	const closeQRModal = () => {
		setShowQRModal(false);
		setSelectedQR(null);
	};

	return (
		<div className="admin-qr-main">
			<h1 className="admin-qr-title">QR Code Management</h1>
			<p className="admin-qr-desc">
				Welcome to the QR Code Management Dashboard — create, customize, and manage QR codes to track attendance and collect participant details for your events or programs.
			</p>
			<div className="admin-qr-actions">
				<button
					className="admin-qr-action-btn"
					onClick={() => setShowCreateForm(!showCreateForm)}
				>
					+ Create New QR Code
				</button>
				<button className="admin-qr-action-btn" disabled>
					View Reports
				</button>
			</div>

			{showCreateForm && (
				<div className="create-qr-form">
					<h2>Create New QR Code</h2>
					<form onSubmit={handleSubmit}>
						{/* Basic Info */}
						<div className="form-group">
							<label>Name *</label>
							<input
								type="text"
								name="name"
								value={formData.name}
								onChange={handleFormChange}
								required
								placeholder="Event name"
							/>
						</div>
						<div className="form-group">
							<label>Description</label>
							<textarea
								name="description"
								value={formData.description}
								onChange={handleFormChange}
								placeholder="Event description"
							/>
						</div>
						<div className="form-group">
							<label>Location</label>
							<input
								type="text"
								name="location"
								value={formData.location}
								onChange={handleFormChange}
								placeholder="Event location"
							/>
						</div>
						<div className="form-group">
							<label>Event Type</label>
							<select name="eventType" value={formData.eventType} onChange={handleFormChange}>
								<option value="">Select type</option>
								<option value="meeting">Meeting</option>
								<option value="conference">Conference</option>
								<option value="workshop">Workshop</option>
								<option value="training">Training</option>
								<option value="other">Other</option>
							</select>
						</div>
						<div className="form-row">
							<div className="form-group">
								<label>Valid From</label>
								<input
									type="datetime-local"
									name="validFrom"
									value={formData.validFrom}
									onChange={handleFormChange}
								/>
							</div>
							<div className="form-group">
								<label>Valid Until</label>
								<input
									type="datetime-local"
									name="validUntil"
									value={formData.validUntil}
									onChange={handleFormChange}
								/>
							</div>
						</div>
						{/* Dynamic Form Fields */}
						<div className="form-group">
							<label>
								<input
									type="checkbox"
									name="requiresForm"
									checked={formData.requiresForm}
									onChange={handleFormChange}
								/>
								Require form submission
							</label>
						</div>

						<div className='form-group'>
							<label>
								<input
									type='checkbox'
									name='AllowMultipleSubmissions'
									checked={formData.AllowMultipleSubmissions || false}
									onChange={handleFormChange}
								/>
								Allow Multiple Responses Per User Device?
							</label>

						</div>

						{formData.requiresForm && (
							<div className="form-group">
								<label>Add Form Fields</label>
								<div className="field-input">
									<input
										type="text"
										value={newField}
										onChange={e => setNewField(e.target.value)}
										placeholder="Enter field name"
									/>
									<button type="button" onClick={addField}>+ Add Field</button>
								</div>
								<ul className="form-fields-list">
									{formData.formFields.map(field => (
										<li key={field}>
											{field} <button type="button" onClick={() => removeField(field)}>x</button>
										</li>
									))}
								</ul>
							</div>
						)}

						<div className="form-group">
							<label>
								<input
									type="checkbox"
									name="isActive"
									checked={formData.isActive}
									onChange={handleFormChange}
								/>
								Active
							</label>
						</div>
						<div className="form-actions">
							<button type="submit" disabled={loading}>
								{loading ? 'Creating...' : 'Create QR Code'}
							</button>
							<button type="button" onClick={() => setShowCreateForm(false)}>
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			{/* QR Codes List */}
			<div className="admin-qr-list">
				{qrCodes.length === 0 ? (
					<div className="admin-qr-empty">
						<p>No QR codes found. Click "Create New QR Code" to get started.</p>
					</div>
				) : (
					qrCodes.map(qr => (
						<div key={qr.id} className="qr-code-item">
							<div className="qr-code-info">
								<h3>{qr.name}</h3>
								<p>{qr.description}</p>
								<p>Location: {qr.location}</p>
								<p>Scans: {qr.scanCount || 0}</p>
								<p>Status: {qr.isActive ? 'Active' : 'Inactive'}</p>
							</div>
							<div className="qr-code-actions">
								<button onClick={() => viewQRCode(qr)}>View</button>
								<button onClick={() => toggleActive(qr.id, qr.isActive)}>
									{qr.isActive ? 'Deactivate' : 'Activate'}
								</button>
								<button onClick={() => deleteQRCode(qr.id)}>Delete</button>
							</div>
						</div>
					))
				)}
			</div>

			{showQRModal && selectedQR && (
				<div className="qr-modal-overlay" onClick={closeQRModal}>
					<div className="qr-modal-content" onClick={(e) => e.stopPropagation()}>
						<div className="qr-modal-header">
							<h2>{selectedQR.name}</h2>
							<button className="qr-modal-close" onClick={closeQRModal}>×</button>
						</div>
						<div className="qr-modal-body">
							<div className="qr-code-display">
								<QRCode value={`${window.location.origin}/scan-form/${selectedQR.qrId}`} size={200} />
							</div>
							<div className="qr-details">
								<p><strong>URL:</strong> <a href={`${window.location.origin}/scan-form/${selectedQR.qrId}`} target="_blank" rel="noopener noreferrer">{`${window.location.origin}/scan-form/${selectedQR.qrId}`}</a></p>
								<p><strong>Description:</strong> {selectedQR.description}</p>
								<p><strong>Location:</strong> {selectedQR.location}</p>
								<p><strong>Event Type:</strong> {selectedQR.eventType}</p>
								<p><strong>Status:</strong> {selectedQR.isActive ? 'Active' : 'Inactive'}</p>
								<p><strong>Scans:</strong> {selectedQR.scanCount || 0}</p>
								{selectedQR.requiresForm && selectedQR.formFields.length > 0 && (
									<div>
										<strong>Form Fields:</strong>
										<ul>
											{selectedQR.formFields.map(field => (
												<li key={field}>{field}</li>
											))}
										</ul>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AdminQRCodes;
