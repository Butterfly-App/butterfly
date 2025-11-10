


export default async function CreateLogPage({
    ,
}: {
    ;
}) {
    const ;

    return (
        

    );
}

/* 
     const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    phone: profile.phone || "",
    address: profile.address || "",
  });

    const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateUserProfile(profile.user_id, formData);

      if (result.success) {
        setIsViewing(false);
        router.refresh();
      } else {
        alert(result.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating the profile");
    } finally {
      setIsSaving(false);
    }
  };


  const handleCancel = () => {
    setFormData({
      full_name: profile.full_name || "",
      phone: profile.phone || "",
      address: profile.address || "",
    });
    setIsViewing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-CA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  
  <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) =>
                setFormData({ ...formData, full_name: e.target.value })
              }
              disabled={!isViewing}
              placeholder="Enter full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              disabled={!isViewing}
              placeholder="Enter phone number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              disabled={!isViewing}
              placeholder="Enter address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-1">
              <Label className="text-xs text-zinc-500">Created</Label>
              <p className="text-sm">{formatDate(profile.created_at)}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-zinc-500">Last Updated</Label>
              <p className="text-sm">{formatDate(profile.updated_at)}</p>
            </div>
          </div>
        </div>
  
  
  
  */