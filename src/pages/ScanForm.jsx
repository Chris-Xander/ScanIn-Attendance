import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase/config';
import { doc, addDoc, collection, updateDoc, getDocs, getDoc, setDoc } from 'firebase/firestore';
import { getDeviceId } from '../utility/deviceFingerprint.jsx';
import '../page_styles/ScanForm.css';

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

	useEffect(() => {
		async function fetchQRCodeData() {
			if (!qrId) {
				setError('Invalid QR code');
				setLoading(false);
				return;
			}

			try {
				const qrCodesRef = collection(db, 'customQRCodes');
				const qrCodesSnapshot = await getDocs(qrCodesRef);
				const qrCode = qrCodesSnapshot.docs.find(doc => doc.data().qrId === qrId);

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

				setQrCodeData(qrData);

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
		setError(null); // Clear any previous errors

		try {
			console.log('Starting attendance submission...');

			// Genrate Device Fingerprint
			const deviceId = await getDeviceId();
			console.log('Device ID created:', deviceId);

			//check for multi submissions from the same device
			const duplicateCheckRef = doc(db, 'formSubmitCheck', `${qrId}_${deviceId}`);
			const duplicateCheckSnap = await getDoc(duplicateCheckRef);

			if (duplicateCheckSnap.exists()) {
				console.log('Multiple Submission Detected')
				setError('You cannot submit more than 1 response!');
				setSubmitting(false);
				return;
			}

			const attendanceData = {
				qrCodeId: qrId,
				qrCodeName: qrCodeData.name,
				adminId: qrCodeData.adminId,
				timestamp: new Date().toISOString(),
				status: 'clock-in',
				formData: qrCodeData.requiresForm ? formData : null,
				location: qrCodeData.location,
				eventType: qrCodeData.eventType,
				...(currentUser && { memberId: currentUser.uid })
			};

			console.log('Submitting attendance record...');
			const attendanceDocRef = await addDoc(collection(db, 'attendanceRecords'), attendanceData);
			console.log('Attendance record submitted successfully:', attendanceDocRef.id);

            if (qrCodeData.requiresForm) {
				console.log('Submitting form data...');
                await setDoc(doc(db, 'formSubmitData', `${qrId}_${deviceId}`), {
					attendanceRecordId: attendanceDocRef.id,
					qrCodeId: qrId,
					adminId: qrCodeData.adminId,
					timestamp: new Date().toISOString(),
					formData: formData,
					deviceId,
					...(currentUser && { memberId: currentUser.uid })
                });
				console.log('Form data submitted successfully');

				// Add lightweight duplicate check record
				await setDoc(doc(db, 'formSubmitCheck', `${qrId}_${deviceId}`), {
					qrCodeId: qrId,
					deviceId
				});
				console.log('Duplicate check record added successfully');
            }

			// Update scan count (only if user is authenticated to avoid permissions error)
			if (currentUser) {
				console.log('Updating scan count...');
				const qrCodesRef = collection(db, 'customQRCodes');
				const qrCodesSnapshot = await getDocs(qrCodesRef);
				const qrCodeDoc = qrCodesSnapshot.docs.find(doc => doc.data().qrId === qrId);

				if (qrCodeDoc) {
					const currentScanCount = qrCodeDoc.data().scanCount || 0;
					console.log('Current scan count:', currentScanCount);
					await updateDoc(doc(db, 'customQRCodes', qrCodeDoc.id), {
						scanCount: currentScanCount + 1
					});
					console.log('Scan count updated successfully');
				} else {
					console.warn('QR code document not found for scan count update');
				}
			}

			console.log('Attendance submission completed successfully');
			setSubmitted(true);
		} catch (err) {
			console.error('Error submitting attendance:', err);
			console.error('Error details:', {
				message: err.message,
				code: err.code,
				stack: err.stack
			});
			setError(`Failed to submit attendance: ${err.message || 'Please try again.'}`);
		} finally {
			setSubmitting(false);
		}
	};

	if (loading) return <div className="member-bg"><h1>Loading...</h1></div>;
	if (error) return <div className="member-bg"><h1>Error</h1><p>{error}</p></div>;
	if (submitted) return <div className="member-bg"><h1>Attendance Recorded!</h1></div>;

	return (
		<div className="member-bg">
			<div className="memberMain">
				<div className="member-container">
					<div className="scan-form-container">
						<h1>{qrCodeData.name}</h1>
						<p>{qrCodeData.description}</p>

						{qrCodeData.requiresForm ? (
							<form onSubmit={handleSubmit} className="scan-form-form">
								{qrCodeData.formFields.map(field => (
									<div className="scan-form-group" key={field}>
										<label>{field}{field.toLowerCase().includes('name') || field.toLowerCase().includes('email') ? ' *' : ''}</label>
										{getInputType(field) === 'text' && !field.toLowerCase().includes('reason') && (
											<input
												type="text"
												name={field}
												value={formData[field] || ''}
												onChange={handleFormChange}
												required={field.toLowerCase().includes('name') || field.toLowerCase().includes('email')}
												placeholder={`Enter ${field}`}
												className="scan-form-input"
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
												className="scan-form-input"
											/>
										)}
										{getInputType(field) === 'tel' && (
											<input
												type="tel"
												name={field}
												value={formData[field] || ''}
												onChange={handleFormChange}
												placeholder={`Enter ${field}`}
												className="scan-form-input"
											/>
										)}
										{field.toLowerCase().includes('reason') && (
											<textarea
												name={field}
												value={formData[field] || ''}
												onChange={handleFormChange}
												placeholder={`Enter ${field}`}
												className="scan-form-textarea"
											/>
										)}
									</div>
								))}
								<div className='submit-button-container'>
									<button type="submit" disabled={submitting}>
										{submitting ? 'Submitting...' : 'Submit Attendance'}
									</button>
								</div>
							</form>
						) : (
							<div>
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
