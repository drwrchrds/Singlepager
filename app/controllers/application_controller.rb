class ApplicationController < ActionController::Base
  # Prevent CSRF attacks by raising an exception.
  # For APIs, you may want to use :null_session instead.
  protect_from_forgery with: :exception

  helper_method :current_user, :logged_in?

  def current_user
    return nil if session[:token].nil?
    @current_user ||= User.find_by(token: session[:token])
  end

  def logged_in?
    !!current_user
  end

  def login!(user)
    @current_user = user
    session[:token] = user.reset_session_token!
  end

  def logout!
    current_user.reset_session_token!
    session[:token] = nil
  end

  def check_logged_in
    redirect_to splash_url unless logged_in?
  end

  def check_permissions(thing)
    redirect_to splash_url unless current_user && thing.owner.id == current_user.id
  end
end
