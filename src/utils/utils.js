const validProfileEdit = (req) => {
    const allowedUpdates = ["firstName", "lastName", "age", "gender","about", "photoUrl", "skills"];

    const isEditAllowed = Object.keys(req.body).every((field) => {
                return allowedUpdates.includes(field);
    });

    return isEditAllowed;
}

module.exports = {
    validProfileEdit
}