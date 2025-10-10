import { Notes } from "../models/note.model.js";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/api.error.js";
import { ApiResponse } from "../utils/api.response.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getProjectNote = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notes = await Notes.find({
    project: id,
  });

  if (!notes) {
    throw new ApiError("The note is not found", 404);
  }

  return new ApiResponse(202, notes, "The notes data.");
});

export const createNote = asyncHandler(async (req, res) => {
  const createNoteData = req.body.note;
  const { id } = req.params;

  const noteData = {
    project: id,
    note: createNoteData,
  };
  const newNote = await Notes.create(noteData);

  await Project.updateOne(
    { _id: id },
    {
      $push: {
        notes: newNote._id,
      },
    },
  );

  return res
    .status(202)
    .json(new ApiResponse(202, newNote, "The note has been created"));
});

export const updateNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;

  const updateNoteData = req.body.note;

  const updatedNote = await Notes.updateOne(
    { _id: noteId },
    {
      note: updateNoteData,
    },
    { new: true },
  );

  if (!updatedNote) {
    throw new ApiError("Note not found", 404);
  }

  return res
    .status(202)
    .json(new ApiResponse(202, updatedNote, "The note has been updated"));
});

export const deleteNote = asyncHandler(async (req, res) => {
  const { id, noteId } = req.params;

  const note = await Notes.findById(noteId);
  
  if (!note) {
    throw new ApiError("Note not found", 404);
  }

  await Notes.findByIdAndDelete(noteId);

  await Project.updateOne({ _id: id }, { $pull: { notes: noteId } });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Note deleted successfully"));
});
