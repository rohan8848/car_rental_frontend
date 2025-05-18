import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  FiMail,
  FiTrash2,
  FiCheckCircle,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiMessageSquare,
  FiClock,
} from "react-icons/fi";
import api from "../../services/api";

const ManageMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedMessage, setExpandedMessage] = useState(null);
  const [response, setResponse] = useState("");
  const [filter, setFilter] = useState("all"); // all, unread, read, responded

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get("/messages");
      if (response.data.success) {
        setMessages(response.data.data);
      } else {
        toast.error("Failed to load messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Error loading messages");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this message?"
    );
    if (!confirmDelete) return;

    try {
      const response = await api.delete(`/messages/${id}`);
      if (response.data.success) {
        setMessages(messages.filter((message) => message._id !== id));
        toast.success("Message deleted successfully");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Failed to delete message");
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const response = await api.put(`/messages/${id}/status`, { status });
      if (response.data.success) {
        setMessages(
          messages.map((message) =>
            message._id === id ? response.data.data : message
          )
        );
        toast.success(`Message marked as ${status}`);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Error updating message status:", error);
      toast.error("Failed to update message status");
    }
  };

  const handleResponseSubmit = async (id) => {
    if (!response.trim()) {
      toast.error("Response cannot be empty");
      return;
    }

    try {
      const responseData = await api.put(`/messages/${id}/status`, {
        status: "responded",
        response,
      });

      if (responseData.data.success) {
        setMessages(
          messages.map((message) =>
            message._id === id ? responseData.data.data : message
          )
        );
        setResponse("");
        toast.success("Response sent successfully");
      } else {
        toast.error(responseData.data.message);
      }
    } catch (error) {
      console.error("Error sending response:", error);
      toast.error("Failed to send response");
    }
  };

  const toggleExpand = (id) => {
    setExpandedMessage(expandedMessage === id ? null : id);
  };

  const getFilteredMessages = () => {
    switch (filter) {
      case "unread":
        return messages.filter((message) => message.status === "unread");
      case "read":
        return messages.filter((message) => message.status === "read");
      case "responded":
        return messages.filter((message) => message.status === "responded");
      default:
        return messages;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "unread":
        return (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
            Unread
          </span>
        );
      case "read":
        return (
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
            Read
          </span>
        );
      case "responded":
        return (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            Responded
          </span>
        );
      default:
        return null;
    }
  };

  const filteredMessages = getFilteredMessages();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Messages</h1>
        <button
          onClick={fetchMessages}
          className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <FiRefreshCw className="mr-2" />
          Refresh
        </button>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg ${
              filter === "all"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            All ({messages.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-4 py-2 rounded-lg ${
              filter === "unread"
                ? "bg-yellow-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Unread ({messages.filter((m) => m.status === "unread").length})
          </button>
          <button
            onClick={() => setFilter("read")}
            className={`px-4 py-2 rounded-lg ${
              filter === "read"
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Read ({messages.filter((m) => m.status === "read").length})
          </button>
         
        </div>
      </div>

      {filteredMessages.length === 0 ? (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <FiMessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No messages found</p>
          <p className="text-gray-400 mt-2">
            {filter !== "all"
              ? `No ${filter} messages available`
              : "Your message inbox is empty"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message._id}
              className="bg-gray-50 rounded-lg shadow-sm overflow-hidden border border-gray-200"
            >
              <div
                className="p-4 cursor-pointer flex justify-between items-start"
                onClick={() => toggleExpand(message._id)}
              >
                <div>
                  <div className="flex items-center mb-1">
                    {getStatusBadge(message.status)}
                    <span className="ml-2 text-gray-500 text-xs">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold">{message.name}</h3>
                  <p className="text-blue-600">{message.email}</p>
                  <p className="text-sm text-gray-500">
                    Topic:{" "}
                    {message.topic.charAt(0).toUpperCase() +
                      message.topic.slice(1)}
                  </p>
                </div>
                <div className="flex items-center">
                  {expandedMessage === message._id ? (
                    <FiChevronUp className="text-gray-500" />
                  ) : (
                    <FiChevronDown className="text-gray-500" />
                  )}
                </div>
              </div>

              {expandedMessage === message._id && (
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-700 mb-2">
                      Message:
                    </h4>
                    <p className="bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                      {message.message}
                    </p>
                  </div>

                  {message.status === "responded" && message.response && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-700 mb-2">
                        Your Response:
                      </h4>
                      <p className="bg-blue-50 p-3 rounded-lg whitespace-pre-wrap">
                        {message.response}
                      </p>
                    </div>
                  )}

                

                  <div className="flex justify-end space-x-2">
                    {message.status === "unread" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStatusChange(message._id, "read");
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center"
                      >
                        <FiCheckCircle className="mr-2" />
                        Mark as Read
                      </button>
                    )}

                   

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(message._id);
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center"
                    >
                      <FiTrash2 className="mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageMessages;
