class Patient:
    def __init__(self, patient_id, name, age):
        self.id = patient_id
        self.name = name
        self.age = age

class Doctor:
    def __init__(self, doctor_id, name, specialization):
        self.id = doctor_id
        self.name = name
        self.specialization = specialization

class Appointment:
    def __init__(self, appointment_id, patient_id, doctor_id, datetime):
        self.id = appointment_id
        self.patient_id = patient_id
        self.doctor_id = doctor_id
        self.datetime = datetime

class ClinicSystem:
    def __init__(self):
        self.patients = {}
        self.doctors = {}
        self.appointments = {}
        self.next_patient_id = 1
        self.next_doctor_id = 1
        self.next_appointment_id = 1

    def add_patient(self, name, age):
        patient = Patient(self.next_patient_id, name, age)
        self.patients[self.next_patient_id] = patient
        self.next_patient_id += 1
        return patient.id

    def add_doctor(self, name, specialization):
        doctor = Doctor(self.next_doctor_id, name, specialization)
        self.doctors[self.next_doctor_id] = doctor
        self.next_doctor_id += 1
        return doctor.id

    def schedule_appointment(self, patient_id, doctor_id, datetime):
        if patient_id not in self.patients:
            raise ValueError('Invalid patient id')
        if doctor_id not in self.doctors:
            raise ValueError('Invalid doctor id')
        appointment = Appointment(self.next_appointment_id, patient_id, doctor_id, datetime)
        self.appointments[self.next_appointment_id] = appointment
        self.next_appointment_id += 1
        return appointment.id

    def list_patients(self):
        return list(self.patients.values())

    def list_doctors(self):
        return list(self.doctors.values())

    def list_appointments(self):
        return list(self.appointments.values())

def main():
    system = ClinicSystem()
    while True:
        print('\n1. Add Patient')
        print('2. Add Doctor')
        print('3. Schedule Appointment')
        print('4. List Patients')
        print('5. List Doctors')
        print('6. List Appointments')
        print('0. Exit')
        choice = input('Choose: ')
        if choice == '1':
            name = input('Patient name: ')
            age = input('Patient age: ')
            pid = system.add_patient(name, age)
            print(f'Patient added with ID {pid}')
        elif choice == '2':
            name = input('Doctor name: ')
            specialization = input('Doctor specialization: ')
            did = system.add_doctor(name, specialization)
            print(f'Doctor added with ID {did}')
        elif choice == '3':
            pid = int(input('Patient ID: '))
            did = int(input('Doctor ID: '))
            date = input('Appointment time: ')
            aid = system.schedule_appointment(pid, did, date)
            print(f'Appointment scheduled with ID {aid}')
        elif choice == '4':
            for p in system.list_patients():
                print(f'{p.id}: {p.name} ({p.age})')
        elif choice == '5':
            for d in system.list_doctors():
                print(f'{d.id}: {d.name} ({d.specialization})')
        elif choice == '6':
            for a in system.list_appointments():
                print(f'{a.id}: patient {a.patient_id}, doctor {a.doctor_id} at {a.datetime}')
        elif choice == '0':
            break
        else:
            print('Invalid choice')

if __name__ == '__main__':
    main()
