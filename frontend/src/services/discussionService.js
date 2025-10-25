import axios from 'axios';
import { getAuthHeader } from './api';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Questions API
export const getQuestionsBySpecimen = async (specimenId, page = 1, limit = 10, sortBy = 'newest') => {
  try {
    const response = await axios.get(
      `${API_URL}/discussions/specimen/${specimenId}/questions`,
      { 
        params: { 
          page, 
          limit,
          sortBy
        },
        headers: getAuthHeader(),
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const getQuestion = async (questionId) => {
  try {
    const response = await axios.get(
      `${API_URL}/discussions/questions/${questionId}`,
      { 
        headers: getAuthHeader(),
        withCredentials: true 
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching question:', error);
    throw error;
  }
};

export const createQuestion = async (questionData) => {
  try {
    const response = await axios.post(
      `${API_URL}/discussions/specimen/${questionData.specimenId}/questions`,
      questionData,
      { 
        headers: getAuthHeader(),
        withCredentials: true 
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating question:', error);
    throw error;
  }
};

export const updateQuestion = async (questionId, updateData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/discussions/questions/${questionId}`,
      updateData,
      { 
        headers: getAuthHeader(),
        withCredentials: true 
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw error;
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    await axios.delete(
      `${API_URL}/discussions/questions/${questionId}`,
      { 
        headers: getAuthHeader(),
        withCredentials: true 
      }
    );
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// Answers API
export const getAnswers = async (questionId, page = 1, limit = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/discussions/questions/${questionId}/answers`,
      { 
        params: { page, limit },
        headers: getAuthHeader(),
        withCredentials: true
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching answers:', error);
    throw error;
  }
};

export const createAnswer = async (questionId, answerData) => {
  try {
    const response = await axios.post(
      `${API_URL}/discussions/questions/${questionId}/answers`,
      answerData,
      { 
        headers: getAuthHeader(),
        withCredentials: true 
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating answer:', error);
    throw error;
  }
};

export const updateAnswer = async (answerId, updateData) => {
  try {
    const response = await axios.patch(
      `${API_URL}/discussions/answers/${answerId}`,
      updateData,
      { 
        headers: getAuthHeader(),
        withCredentials: true 
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating answer:', error);
    throw error;
  }
};

export const deleteAnswer = async (answerId) => {
  try {
    await axios.delete(
      `${API_URL}/discussions/answers/${answerId}`,
      { 
        headers: getAuthHeader(),
        withCredentials: true 
      }
    );
  } catch (error) {
    console.error('Error deleting answer:', error);
    throw error;
  }
};

export const markBestAnswer = async (answerId) => {
  try {
    const response = await axios.patch(
      `${API_URL}/discussions/answers/${answerId}/mark-best`,
      {},
      { 
        headers: getAuthHeader(),
        withCredentials: true 
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error marking best answer:', error);
    throw error;
  }
};

