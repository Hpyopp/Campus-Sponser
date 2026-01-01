// ... imports same ...

// 👇 FINAL POWERFUL DELETE FUNCTION
const deleteEvent = asyncHandler(async (req, res) => {
  console.log(`🔥 DELETE REQUEST: Event ID ${req.params.id}`);
  console.log(`👤 User: ${req.user.name} | Role: ${req.user.role}`);

  const event = await Event.findById(req.params.id);

  if (!event) {
    res.status(404);
    throw new Error('Event not found in Database');
  }

  // Check Permissions (Case Insensitive: Admin = admin = ADMIN)
  const isAdmin = req.user.role.toLowerCase() === 'admin';
  const isOwner = event.user.toString() === req.user.id;

  if (!isAdmin && !isOwner) {
    console.log("⛔ Access Denied: User is neither Admin nor Owner");
    res.status(401);
    throw new Error('Not Authorized to Delete');
  }

  // 🔥 DIRECT DATABASE DELETE COMMAND
  await Event.findByIdAndDelete(req.params.id);
  
  console.log("✅ Event Deleted Successfully!");
  res.status(200).json({ id: req.params.id, message: "Event Deleted Permanently" });
});

// ... baaki exports same ...