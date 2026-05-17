// Mock Firebase service for local development
// Simulates Firestore and Auth behaviors with per-user data scoping

class MockService {
  constructor() {
    this.data = {
      users: {
        'user1': {
          uid: 'user1',
          email: 'member@example.com',
          displayName: 'John Doe',
          role: 'member',
          phone: '+1234567890',
          photoURL: null,
          emailVerified: true
        },
        'user2': {
          uid: 'user2',
          email: 'member2@example.com',
          displayName: 'Jane Smith',
          role: 'member',
          phone: '+1987654321',
          photoURL: null,
          emailVerified: true
        },
        'admin1': {
          uid: 'admin1',
          email: 'admin@example.com',
          displayName: 'Admin User',
          role: 'admin',
          phone: '+1555123456',
          photoURL: null,
          emailVerified: true
        }
      },
      scanHistory: [
        {
          id: 'scan1',
          userId: 'user1',
          memberId: 'user1',
          adminId: 'admin1',
          result: 'Event A Check-in',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          status: 'clock-in'
        },
        {
          id: 'scan2',
          userId: 'user1',
          memberId: 'user1',
          adminId: 'admin1',
          result: 'Event A Check-out',
          timestamp: new Date(Date.now() - 82800000), // ~23 hours ago
          status: 'clock-out'
        },
        {
          id: 'scan3',
          userId: 'user1',
          memberId: 'user1',
          adminId: 'admin1',
          result: 'Event B Check-in',
          timestamp: new Date(Date.now() - 3600000), // 1 hour ago
          status: 'clock-in'
        },
        {
          id: 'scan4',
          userId: 'user2',
          memberId: 'user2',
          adminId: 'admin1',
          result: 'Event C Check-in',
          timestamp: new Date(Date.now() - 7200000), // 2 hours ago
          status: 'clock-in'
        }
      ],
      customQRCodes: [
        {
          id: 'qr1',
          qrId: 'event-a-2024',
          adminId: 'admin1',
          name: 'Event A',
          description: 'Annual Company Meeting',
          location: 'Main Conference Room',
          eventType: 'Meeting',
          fields: ['name', 'email', 'phone'],
          requiresForm: true,
          isActive: true,
          validFrom: '',
          validUntil: '',
          createdAt: new Date(Date.now() - 604800000), // 1 week ago
          scanCount: 15
        },
        {
          id: 'qr2',
          qrId: 'event-b-2024',
          adminId: 'admin1',
          name: 'Event B',
          description: 'Team Building Workshop',
          location: 'Auditorium',
          eventType: 'Workshop',
          fields: ['name', 'email'],
          requiresForm: true,
          isActive: true,
          validFrom: '',
          validUntil: '',
          createdAt: new Date(Date.now() - 259200000), // 3 days ago
          scanCount: 8
        }
      ],
      attendanceRecords: [],
      formSubmitData: [],
      formSubmitCheck: []
    };

    this.listeners = {};
    this.currentUser = null;
  }

  // Auth simulation
  async signInWithEmailAndPassword(email, password) {
    // Simple mock auth - in real app this would validate credentials
    const user = Object.values(this.data.users).find(u => u.email === email);
    if (!user) {
      throw new Error('auth/user-not-found');
    }
    this.currentUser = user;
    return { user };
  }

  async createUserWithEmailAndPassword(email, password) {
    const uid = `user${Date.now()}`;
    const newUser = {
      uid,
      email,
      displayName: email.split('@')[0],
      role: 'member',
      photoURL: null,
      emailVerified: false
    };
    this.data.users[uid] = newUser;
    this.currentUser = newUser;
    return { user: newUser };
  }

  async signOut() {
    this.currentUser = null;
  }

  onAuthStateChanged(callback) {
    // Simulate auth state changes
    setTimeout(() => callback(this.currentUser), 100);
    return () => {}; // unsubscribe
  }

  // Firestore simulation
  collection(collectionName) {
    return {
      addDoc: (data) => this.addDoc(collectionName, data),
      doc: (id) => this.doc(collectionName, id),
      where: (...args) => this.where(collectionName, ...args),
      orderBy: (...args) => this.orderBy(collectionName, ...args),
      onSnapshot: (callback) => this.onSnapshot(collectionName, callback)
    };
  }

  doc(collectionName, id) {
    return {
      setDoc: (data) => this.setDoc(collectionName, id, data),
      getDoc: () => this.getDoc(collectionName, id),
      updateDoc: (data) => this.updateDoc(collectionName, id, data)
    };
  }

  async addDoc(collectionName, data) {
    const id = `${collectionName}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const docData = { ...data, id };

    if (collectionName === 'scanHistory') {
      this.data.scanHistory.push(docData);
      this.notifyListeners('scanHistory');
    } else if (collectionName === 'customQRCodes') {
      this.data.customQRCodes.push(docData);
      this.notifyListeners('customQRCodes');
    } else if (collectionName === 'attendanceRecords') {
      this.data.attendanceRecords.push(docData);
      this.notifyListeners('attendanceRecords');
    } else if (collectionName === 'formSubmitData') {
      this.data.formSubmitData.push(docData);
      this.notifyListeners('formSubmitData');
    } else if (collectionName === 'formSubmitCheck') {
      this.data.formSubmitCheck.push(docData);
      this.notifyListeners('formSubmitCheck');
    }

    return { id };
  }

  async setDoc(collectionName, id, data) {
    if (collectionName === 'users') {
      this.data.users[id] = { ...this.data.users[id], ...data };
    } else if (collectionName === 'formSubmitData') {
      const index = this.data.formSubmitData.findIndex(item => item.id === id);
      if (index !== -1) {
        this.data.formSubmitData[index] = { ...this.data.formSubmitData[index], ...data };
      } else {
        this.data.formSubmitData.push({ ...data, id });
      }
      this.notifyListeners('formSubmitData');
    } else if (collectionName === 'formSubmitCheck') {
      const index = this.data.formSubmitCheck.findIndex(item => item.id === id);
      if (index !== -1) {
        this.data.formSubmitCheck[index] = { ...this.data.formSubmitCheck[index], ...data };
      } else {
        this.data.formSubmitCheck.push({ ...data, id });
      }
      this.notifyListeners('formSubmitCheck');
    }
    this.notifyListeners(collectionName);
  }

  async getDoc(collectionName, id) {
    let doc = null;
    if (collectionName === 'users') {
      doc = this.data.users[id];
    } else if (collectionName === 'formSubmitCheck') {
      doc = this.data.formSubmitCheck.find(item => item.id === id);
    }
    return {
      exists: () => !!doc,
      data: () => doc
    };
  }

  async updateDoc(collectionName, id, data) {
    if (collectionName === 'users') {
      this.data.users[id] = { ...this.data.users[id], ...data };
    } else if (collectionName === 'customQRCodes') {
      const index = this.data.customQRCodes.findIndex(qr => qr.id === id);
      if (index !== -1) {
        this.data.customQRCodes[index] = { ...this.data.customQRCodes[index], ...data };
      }
    }
    this.notifyListeners(collectionName);
  }

  where(collectionName, field, operator, value) {
    return {
      orderBy: (...args) => this.orderBy(collectionName, ...args, { field, operator, value }),
      onSnapshot: (callback) => this.onSnapshot(collectionName, callback, { field, operator, value })
    };
  }

  orderBy(collectionName, field, direction = 'asc', filter = null) {
    return {
      onSnapshot: (callback) => this.onSnapshot(collectionName, callback, filter, { field, direction })
    };
  }

  onSnapshot(collectionName, callback, filter = null, orderBy = null) {
    const listenerId = `${collectionName}_${Date.now()}_${Math.random()}`;

    const getFilteredData = () => {
      let data = [];

      if (collectionName === 'scanHistory') {
        data = this.data.scanHistory.filter(item => {
          if (filter && filter.field === 'userId' && filter.operator === '==') {
            return item.userId === filter.value;
          }
          return true;
        });
      } else if (collectionName === 'customQRCodes') {
        data = this.data.customQRCodes;
      } else if (collectionName === 'attendanceRecords') {
        data = this.data.attendanceRecords;
      } else if (collectionName === 'formSubmitData') {
        data = this.data.formSubmitData;
      } else if (collectionName === 'formSubmitCheck') {
        data = this.data.formSubmitCheck;
      }

      // Apply ordering
      if (orderBy && orderBy.field === 'timestamp') {
        data.sort((a, b) => {
          const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
          const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
          return orderBy.direction === 'desc' ? bTime - aTime : aTime - bTime;
        });
      }

      return data;
    };

    this.listeners[listenerId] = { collectionName, callback, filter, orderBy };

    // Initial callback
    setTimeout(() => {
      const data = getFilteredData();
      callback({
        docs: data.map(item => ({
          id: item.id,
          data: () => item
        }))
      });
    }, 10);

    // Return unsubscribe function
    return () => {
      delete this.listeners[listenerId];
    };
  }

  notifyListeners(collectionName) {
    Object.values(this.listeners).forEach(listener => {
      if (listener.collectionName === collectionName) {
        const data = this.getFilteredDataForListener(listener);
        listener.callback({
          docs: data.map(item => ({
            id: item.id,
            data: () => item
          }))
        });
      }
    });
  }

  getFilteredDataForListener(listener) {
    let data = [];

    if (listener.collectionName === 'scanHistory') {
      data = this.data.scanHistory.filter(item => {
        if (listener.filter && listener.filter.field === 'userId' && listener.filter.operator === '==') {
          return item.userId === listener.filter.value;
        }
        return true;
      });
    } else if (listener.collectionName === 'customQRCodes') {
      data = this.data.customQRCodes;
    } else if (listener.collectionName === 'attendanceRecords') {
      data = this.data.attendanceRecords;
    } else if (listener.collectionName === 'formSubmitData') {
      data = this.data.formSubmitData;
    } else if (listener.collectionName === 'formSubmitCheck') {
      data = this.data.formSubmitCheck;
    }

    // Apply ordering
    if (listener.orderBy && listener.orderBy.field === 'timestamp') {
      data.sort((a, b) => {
        const aTime = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const bTime = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return listener.orderBy.direction === 'desc' ? bTime - aTime : aTime - bTime;
      });
    }

    return data;
  }

  // Storage simulation
  ref(storage, path) {
    return {
      put: (file) => ({
        on: (event, callback) => {
          if (event === 'state_changed') {
            setTimeout(() => callback({ bytesTransferred: file.size, totalBytes: file.size }), 500);
          }
        },
        then: (resolve) => {
          setTimeout(() => resolve({
            ref: { getDownloadURL: () => Promise.resolve(`https://mock-storage.example.com/${path}`) }
          }), 1000);
        }
      })
    };
  }

  getDownloadURL(ref) {
    return Promise.resolve(`https://mock-storage.example.com/${ref.fullPath}`);
  }
}

// Create singleton instance
const mockService = new MockService();

export default mockService;
