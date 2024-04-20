const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");

exports.deleteOne = (Model) => async (req, res, next) => {
  try {
    await Model.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: "Success", data: null });
  } catch (error) {
    return next(new AppError("Failed to delete data", 400));
  }
};

exports.updateOne = (Model) => async (req, res, next) => {
  try {
    const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json({ status: "Success", data: data });
  } catch (error) {
    return next(new AppError("Failed to update data", 400));
  }
};

exports.createOne = (Model) => async (req, res, next) => {
  try {
    const data = await Model.create(req.body);
    res.status(201).json({ message: "Success", data: data });
  } catch (error) {
    console.log(error);
    return next(new AppError("Failed to create data", 400));
  }
};

exports.getOne = (Model, popOptions) => async (req, res, next) => {
  try {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const data = await query;
    res
      .status(200)
      .json({ message: "Success", results: data.length, data: data });
  } catch (error) {
    return next(new AppError("Failed to get data", 400));
  }
};

exports.getAll = (Model) => async (req, res, next) => {
  try {
    let filter = {};
    if (req.params.tourId) filter = { tour: req.params.tourId };

    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .fields()
      .page();

    const data = await features.query;

    res.status(200).json({
      message: "Success",
      results: data.length,
      data: data,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
