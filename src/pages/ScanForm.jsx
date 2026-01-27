import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, addDoc, collection, updateDoc, getDocs, getDoc, setDoc, query, where, writeBatch, increment } from 'firebase/firestore';
import { getDeviceId } from '../utility/deviceFingerprint.jsx';
import '../page_styles/ScanFormStyling.css';


function ScanForm() {
	const { qrId } = useParams();
	const navigate = useNavigate();
	const { currentUser } = useAuth();
	const [qrCodeData, setQrCodeData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [formData, setFormData] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [optimisticSubmitted, setOptimisticSubmitted] = useState(false);

	useEffect(() => {
		async function fetchQRCodeData() {
			if (!qrId) {
				setError('Invalid QR code');
				setLoading(false);
				return;
			}

			try {
				const qrCodesRef = collection(db, 'customQRCodes');
				// Query for active QR codes with matching qrId
				const q = query(qrCodesRef, where('qrId', '==', qrId), where('isActive', '==', true));
				const qrCodesSnapshot = await getDocs(q);
				const qrCode = qrCodesSnapshot.docs[0]; // Should only be one match

				if (!qrCode) {
					setError('QR code not found');
					setLoading(false);
					return;
				}

				const qrData = qrCode.data();

				if (!qrData.isActive) {
					setError('This QR code is no longer active');
					setLoading(false);
					return;
				}

				const now = new Date();
				if (qrData.validFrom && qrData.validFrom.trim() !== '') {
					const validFrom = new Date(qrData.validFrom);
					if (now < validFrom) {
						setError('This QR code is not yet valid');
						setLoading(false);
						return;
					}
				}
				if (qrData.validUntil && qrData.validUntil.trim() !== '') {
					const validUntil = new Date(qrData.validUntil);
					if (now > validUntil) {
						setError('This QR code has expired');
						setLoading(false);
						return;
					}
				}

				setQrCodeData({ ...qrData, id: qrCode.id });

				// Initialize dynamic form data
				const initialFormData = {};
				if (qrData.requiresForm && qrData.formFields) {
					qrData.formFields.forEach(field => {
						initialFormData[field] = '';
					});
				}
				setFormData(initialFormData);
			} catch (err) {
				console.error('Error fetching QR code data:', err);
				setError('Failed to load QR code data');
			} finally {
				setLoading(false);
			}
		}

		fetchQRCodeData();
	}, [qrId]);

	const handleFormChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({
			...prev,
			[name]: value
		}));
	};

	const getInputType = (fieldName) => {
		const lower = fieldName.toLowerCase();
		if (lower.includes('email')) return 'email';
		if (lower.includes('phone') || lower.includes('mobile')) return 'tel';
		if (lower.includes('date')) return 'date';
		return 'text';
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError(null);
		setOptimisticSubmitted(true); // Immediate feedback

		try {
			console.log('Starting attendance submission...');

			// Parallel execution of device ID generation and duplicate check
			const deviceId = await getDeviceId();
			const duplicateCheckSnap = await getDoc(doc(db, 'formSubmitCheck', `${qrId}_${deviceId}`));

			if (duplicateCheckSnap.exists()) {
				setError('You cannot submit more than 1 response!');
				setOptimisticSubmitted(false);
				setSubmitting(false);
				return;
			}

			const batch = writeBatch(db);

			// Add attendance record
			const attendanceRef = doc(collection(db, 'attendanceRecords'));
			batch.set(attendanceRef, {
				qrCodeId: qrId,
				qrCodeName: qrCodeData.name,
				adminId: qrCodeData.adminId,
				timestamp: new Date().toISOString(),
				status: 'clock-in',
				formData: qrCodeData.requiresForm ? formData : null,
				location: qrCodeData.location,
				eventType: qrCodeData.eventType,
				...(currentUser && { memberId: currentUser.uid })
			});

			if (qrCodeData.requiresForm) {
				// Add form data
				const formRef = doc(db, 'formSubmitData', `${qrId}_${deviceId}`);
				batch.set(formRef, {
					attendanceRecordId: attendanceRef.id,
					qrCodeId: qrId,
					adminId: qrCodeData.adminId,
					timestamp: new Date().toISOString(),
					formData: formData,
					deviceId,
					...(currentUser && { memberId: currentUser.uid })
				});

				// Add duplicate check
				const checkRef = doc(db, 'formSubmitCheck', `${qrId}_${deviceId}`);
				batch.set(checkRef, {
					qrCodeId: qrId,
					deviceId
				});
			}

			// Update scan count atomically
			if (currentUser) {
				const qrRef = doc(db, 'customQRCodes', qrCodeData.id); // Assuming qrCodeData has the document ID
				batch.update(qrRef, {
					scanCount: increment(1)
				});
			}

			await batch.commit();
			console.log('All operations completed successfully');
			setSubmitted(true);
		} catch (err) {
			console.error('Error submitting attendance:', err);
			setError(`Failed to submit attendance: ${err.message || 'Please try again.'}`);
			setOptimisticSubmitted(false); // Revert on error
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="scanform-bg"><h1>Loading...</h1></div>;
	if (error) return <div className="scanform-bg"><h1>Error</h1><p>{error}</p></div>;
	if (submitted || optimisticSubmitted) return <div className="scanform-bg"><h1>Attendance Recorded!</h1></div>;

	return (
		<div className="scanform-bg">
			<div className="scanform-main">
				<div className="scanform-container">
					<div className="scanform-form-container">
						<h1>{qrCodeData.name}</h1>
						<p>{qrCodeData.description}</p>

						{qrCodeData.requiresForm ? (
							<form onSubmit={handleSubmit} className="scanform-form">
								{qrCodeData.formFields.map(field => (
									<div className="scanform-group" key={field}>
										<label>{field}{field.toLowerCase().includes('name') || field.toLowerCase().includes('email') ? ' *' : ''}</label>
										{getInputType(field) === 'text' && !field.toLowerCase().includes('reason') && (
											<input
												type="text"
												name={field}
												value={formData[field] || ''}
												onChange={handleFormChange}
												required={field.toLowerCase().includes('name') || field.toLowerCase().includes('email')}
												placeholder={`Enter ${field}`}
												className="scanform-input"
											/>
										)}
										{getInputType(field) === 'email' && (
											<input
												type="email"
												name={field}
												value={formData[field] || ''}
												onChange={handleFormChange}
												required
												placeholder={`Enter ${field}`}
												className="scanform-input"
											/>
										)}
										{getInputType(field) === 'tel' && (
											<input
												type="tel"
												name={field}
												value={formData[field] || ''}
												onChange={handleFormChange}
												placeholder={`Enter ${field}`}
												className="scanform-input"
											/>
										)}
										{field.toLowerCase().includes('reason') && (
											<textarea
												name={field}
												value={formData[field] || ''}
												onChange={handleFormChange}
												placeholder={`Enter ${field}`}
												className="scanform-textarea"
											/>
										)}
									</div>
								))}
								<div className='scanform-submit-container'>
									<button type="submit" disabled={submitting}>
										{submitting ? 'Submitting...' : 'Submit Attendance'}
									</button>
								</div>
							</form>
						) : (
							<div className='scanform-message'>
								<p>This QR code does not require additional information.</p>
								<button onClick={handleSubmit}>Record Attendance</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default ScanForm;
