import pydicom

ds = pydicom.dcmread("image19.dcm")
print("StudyInstanceUID:", ds.get("StudyInstanceUID", "Non défini"))
print("SeriesInstanceUID:", ds.get("SeriesInstanceUID", "Non défini"))
print("SOPInstanceUID:", ds.get("SOPInstanceUID", "Non défini"))