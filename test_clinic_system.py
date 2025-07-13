import clinic_system


def test_add_patient():
    cs = clinic_system.ClinicSystem()
    pid = cs.add_patient("John Doe", 30)
    assert pid == 1
    assert len(cs.list_patients()) == 1


def test_add_doctor():
    cs = clinic_system.ClinicSystem()
    did = cs.add_doctor("Dr Smith", "Cardiology")
    assert did == 1
    assert len(cs.list_doctors()) == 1


def test_schedule_appointment():
    cs = clinic_system.ClinicSystem()
    pid = cs.add_patient("Jane", 25)
    did = cs.add_doctor("Dr Brown", "Neurology")
    aid = cs.schedule_appointment(pid, did, "2024-01-01 10:00")
    assert aid == 1
    assert len(cs.list_appointments()) == 1
