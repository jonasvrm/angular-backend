var openModal = function (params) {
    $("#GeneralModalBody").html(params.body);
    $("#GeneralModalTitle").html(params.title);
    $("#GeneralModalSubmit").html(params.submitLabel);

    $('#GeneralModal').modal('show');
}

var deleteDialog = function (params) {
    openModal({ body: "Do you really want to delete this item?", title: "Delete?", submitLabel: "Delete" });

    $("#GeneralModalSubmit").on("click", function () {
        params.onConfirm();
        $('#GeneralModal').modal('hide');
    });
}